const Invitation = require('../models/Invitation');
const GiftCircle = require('../models/GiftCircle');
const Questionnaire = require('../models/Questionnaire');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EmailService = require('../services/emailService');

/**
 * Get all invitations
 * GET /api/invitations
 */
exports.getInvitations = async (req, res) => {
  try {
    const { status } = req.query;
    const invitations = await Invitation.findByInviter(req.userId, status);
    const stats = await Invitation.getStats(req.userId);

    res.json({
      invitations,
      stats
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      error: 'Failed to get invitations'
    });
  }
};

/**
 * Create invitation
 * POST /api/invitations
 */
exports.createInvitation = async (req, res) => {
  try {
    const { inviteeName, inviteeEmail, personalMessage, relationship } = req.body;

    // Check if already invited
    const exists = await Invitation.existsForEmail(req.userId, inviteeEmail);
    if (exists) {
      return res.status(400).json({
        error: 'Already invited',
        message: 'An invitation has already been sent to this email'
      });
    }

    // Check if already in circle
    const inCircle = await GiftCircle.exists(req.userId, null, inviteeEmail);
    if (inCircle) {
      return res.status(400).json({
        error: 'Already in circle',
        message: 'This person is already in your gift circle'
      });
    }

    // Create invitation
    const invitation = await Invitation.createInvitation({
      inviterId: req.userId,
      inviteeName,
      inviteeEmail,
      personalMessage,
      relationship
    });

    // Get inviter info for email
    const inviter = await User.findById(req.userId);

    // Generate invite link
    const inviteLink = `${process.env.WEB_APP_URL}/invite/${invitation.token}`;

    // Send email
    try {
      await EmailService.sendInvitation({
        to: inviteeEmail,
        inviteeName,
        inviterName: inviter.name,
        personalMessage,
        inviteLink
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the request, invitation is still created
    }

    res.status(201).json({
      message: 'Invitation sent',
      invitation: {
        ...invitation.toJSON(),
        inviteLink
      }
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({
      error: 'Failed to send invitation'
    });
  }
};

/**
 * Resend invitation
 * PUT /api/invitations/:id/resend
 */
exports.resendInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found'
      });
    }

    if (!invitation.inviter.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    // Update invitation
    const updated = await Invitation.resend(req.params.id);

    // Get inviter info
    const inviter = await User.findById(req.userId);
    const inviteLink = `${process.env.WEB_APP_URL}/invite/${invitation.token}`;

    // Resend email
    try {
      await EmailService.sendInvitation({
        to: invitation.inviteeEmail,
        inviteeName: invitation.inviteeName,
        inviterName: inviter.name,
        inviteLink
      });
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError);
    }

    res.json({
      message: 'Invitation resent',
      sentCount: updated.sentCount
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      error: 'Failed to resend invitation'
    });
  }
};

/**
 * Delete invitation
 * DELETE /api/invitations/:id
 */
exports.deleteInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        error: 'Invitation not found'
      });
    }

    if (!invitation.inviter.equals(req.userId)) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    await Invitation.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Invitation deleted'
    });
  } catch (error) {
    console.error('Delete invitation error:', error);
    res.status(500).json({
      error: 'Failed to delete invitation'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// Web Questionnaire (Public endpoints for invitees)
// ═══════════════════════════════════════════════════════════════

/**
 * Validate invitation token
 * GET /api/invitations/web/:token
 */
exports.validateWebToken = async (req, res) => {
  try {
    const result = await Invitation.validateToken(req.params.token);

    if (!result.valid) {
      return res.status(400).json({
        error: result.error
      });
    }

    // Mark as opened
    await Invitation.markOpened(req.params.token);

    res.json({
      valid: true,
      invitation: result.invitation
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({
      error: 'Failed to validate invitation'
    });
  }
};

/**
 * Submit web questionnaire
 * POST /api/invitations/web/:token/respond
 */
exports.submitWebQuestionnaire = async (req, res) => {
  try {
    const { name, email, questionnaire } = req.body;

    // Validate token
    const validation = await Invitation.validateToken(req.params.token);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error
      });
    }

    const invitation = await Invitation.findByToken(req.params.token);

    // Check if user already exists
    let user = await User.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create guest user
      user = await User.create({
        email,
        name
      });
      isNewUser = true;
    }

    // Save questionnaire (uses camelCase directly now)
    await Questionnaire.upsert(user._id, questionnaire);

    // Add to inviter's circle
    const circle = await GiftCircle.create({
      owner: invitation.inviter._id || invitation.inviter,
      member: user._id,
      relationship: invitation.relationship || 'Friend',
      status: 'accepted',
      autoAdded: true
    });

    // Auto-add inviter to invitee's circle
    await GiftCircle.create({
      owner: user._id,
      member: invitation.inviter._id || invitation.inviter,
      relationship: 'Friend',
      status: 'accepted',
      autoAdded: true
    });

    // Mark invitation as completed
    await Invitation.markCompleted(req.params.token);

    // Notify inviter
    await Notification.createInvitationAccepted(
      invitation.inviter._id || invitation.inviter,
      name,
      circle._id
    );

    res.json({
      message: 'Thank you! Your preferences have been saved.',
      isNewUser,
      canDownloadApp: true
    });
  } catch (error) {
    console.error('Submit web questionnaire error:', error);
    res.status(500).json({
      error: 'Failed to submit questionnaire'
    });
  }
};
