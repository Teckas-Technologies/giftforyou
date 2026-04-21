const Questionnaire = require('../models/Questionnaire');
const User = require('../models/User');

/**
 * Get my questionnaire
 * GET /api/questionnaire
 */
exports.getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByUserId(req.userId);
    const completionStatus = await Questionnaire.getCompletionStatus(req.userId);

    // Get user basic info
    const user = await User.findById(req.userId)
      .select('name birthday profilePhoto avatarType questionnaireCompletionPercent');

    res.json({
      basicInfo: {
        name: user?.name,
        birthday: user?.birthday,
        profilePhoto: user?.profilePhoto,
        avatarType: user?.avatarType
      },
      questionnaire: questionnaire || {},
      completionPercent: user?.questionnaireCompletionPercent || 0,
      sections: completionStatus
    });
  } catch (error) {
    console.error('Get questionnaire error:', error);
    res.status(500).json({
      error: 'Failed to get questionnaire'
    });
  }
};

/**
 * Save questionnaire
 * PUT /api/questionnaire
 */
exports.saveQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.upsert(req.userId, req.body);
    const completionPercent = await Questionnaire.updateCompletionPercent(req.userId);

    res.json({
      message: 'Questionnaire saved',
      questionnaire,
      completionPercent
    });
  } catch (error) {
    console.error('Save questionnaire error:', error);
    res.status(500).json({
      error: 'Failed to save questionnaire'
    });
  }
};

/**
 * Get completion status
 * GET /api/questionnaire/completion
 */
exports.getCompletionStatus = async (req, res) => {
  try {
    const status = await Questionnaire.getCompletionStatus(req.userId);

    // Get overall percentage
    const user = await User.findById(req.userId).select('questionnaireCompletionPercent');

    res.json({
      completionPercent: user?.questionnaireCompletionPercent || 0,
      sections: status
    });
  } catch (error) {
    console.error('Get completion status error:', error);
    res.status(500).json({
      error: 'Failed to get completion status'
    });
  }
};

/**
 * Get wishlist links
 * GET /api/wishlist/links
 */
exports.getWishlistLinks = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByUserId(req.userId);

    res.json({
      links: questionnaire?.wishlistLinks || []
    });
  } catch (error) {
    console.error('Get wishlist links error:', error);
    res.status(500).json({
      error: 'Failed to get wishlist links'
    });
  }
};

/**
 * Add wishlist link
 * POST /api/wishlist/links
 */
exports.addWishlistLink = async (req, res) => {
  try {
    const { url, title, linkType } = req.body;

    let questionnaire = await Questionnaire.findByUserId(req.userId);

    if (!questionnaire) {
      questionnaire = await Questionnaire.create({ user: req.userId });
    }

    // Limit to 3 links
    if (questionnaire.wishlistLinks && questionnaire.wishlistLinks.length >= 3) {
      return res.status(400).json({
        error: 'Maximum 3 wishlist links allowed'
      });
    }

    questionnaire.wishlistLinks.push({ url, title, linkType });
    await questionnaire.save();

    const newLink = questionnaire.wishlistLinks[questionnaire.wishlistLinks.length - 1];

    res.status(201).json({
      link: newLink
    });
  } catch (error) {
    console.error('Add wishlist link error:', error);
    res.status(500).json({
      error: 'Failed to add wishlist link'
    });
  }
};

/**
 * Delete wishlist link
 * DELETE /api/wishlist/links/:id
 */
exports.deleteWishlistLink = async (req, res) => {
  try {
    await Questionnaire.findOneAndUpdate(
      { user: req.userId },
      { $pull: { wishlistLinks: { _id: req.params.id } } }
    );

    res.json({
      message: 'Wishlist link deleted'
    });
  } catch (error) {
    console.error('Delete wishlist link error:', error);
    res.status(500).json({
      error: 'Failed to delete wishlist link'
    });
  }
};

/**
 * Get registries
 * GET /api/registries
 */
exports.getRegistries = async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByUserId(req.userId);

    res.json({
      registries: questionnaire?.registries || []
    });
  } catch (error) {
    console.error('Get registries error:', error);
    res.status(500).json({
      error: 'Failed to get registries'
    });
  }
};

/**
 * Add registry
 * POST /api/registries
 */
exports.addRegistry = async (req, res) => {
  try {
    const { url, title, registryType, details, expiryDate } = req.body;

    let questionnaire = await Questionnaire.findByUserId(req.userId);

    if (!questionnaire) {
      questionnaire = await Questionnaire.create({ user: req.userId });
    }

    questionnaire.registries.push({ url, title, registryType, details, expiryDate });
    await questionnaire.save();

    const newRegistry = questionnaire.registries[questionnaire.registries.length - 1];

    res.status(201).json({
      registry: newRegistry
    });
  } catch (error) {
    console.error('Add registry error:', error);
    res.status(500).json({
      error: 'Failed to add registry'
    });
  }
};

/**
 * Update registry
 * PUT /api/registries/:id
 */
exports.updateRegistry = async (req, res) => {
  try {
    const { url, title, details, expiryDate, isActive } = req.body;

    const questionnaire = await Questionnaire.findOne({ user: req.userId });

    if (!questionnaire) {
      return res.status(404).json({
        error: 'Registry not found'
      });
    }

    const registry = questionnaire.registries.id(req.params.id);

    if (!registry) {
      return res.status(404).json({
        error: 'Registry not found'
      });
    }

    if (url !== undefined) registry.url = url;
    if (title !== undefined) registry.title = title;
    if (details !== undefined) registry.details = details;
    if (expiryDate !== undefined) registry.expiryDate = expiryDate;
    if (isActive !== undefined) registry.isActive = isActive;

    await questionnaire.save();

    res.json({
      registry
    });
  } catch (error) {
    console.error('Update registry error:', error);
    res.status(500).json({
      error: 'Failed to update registry'
    });
  }
};

/**
 * Delete registry
 * DELETE /api/registries/:id
 */
exports.deleteRegistry = async (req, res) => {
  try {
    await Questionnaire.findOneAndUpdate(
      { user: req.userId },
      { $pull: { registries: { _id: req.params.id } } }
    );

    res.json({
      message: 'Registry deleted'
    });
  } catch (error) {
    console.error('Delete registry error:', error);
    res.status(500).json({
      error: 'Failed to delete registry'
    });
  }
};
