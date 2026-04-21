const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { createInvitationValidator, webQuestionnaireValidator, uuidParamValidator } = require('../middleware/validation');

// Public routes (for web questionnaire)
router.get('/web/:token', invitationController.validateWebToken);
router.post('/web/:token/respond', webQuestionnaireValidator, invitationController.submitWebQuestionnaire);

// Protected routes
router.get('/', authenticate, invitationController.getInvitations);
router.post('/', authenticate, createInvitationValidator, invitationController.createInvitation);
router.put('/:id/resend', authenticate, uuidParamValidator, invitationController.resendInvitation);
router.delete('/:id', authenticate, uuidParamValidator, invitationController.deleteInvitation);

module.exports = router;
