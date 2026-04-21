const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { authenticate } = require('../middleware/auth');
const { questionnaireValidator } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Questionnaire
router.get('/', questionnaireController.getQuestionnaire);
router.put('/', questionnaireValidator, questionnaireController.saveQuestionnaire);
router.get('/completion', questionnaireController.getCompletionStatus);

// Wishlist links
router.get('/wishlist/links', questionnaireController.getWishlistLinks);
router.post('/wishlist/links', questionnaireController.addWishlistLink);
router.delete('/wishlist/links/:id', questionnaireController.deleteWishlistLink);

// Registries
router.get('/registries', questionnaireController.getRegistries);
router.post('/registries', questionnaireController.addRegistry);
router.put('/registries/:id', questionnaireController.updateRegistry);
router.delete('/registries/:id', questionnaireController.deleteRegistry);

module.exports = router;
