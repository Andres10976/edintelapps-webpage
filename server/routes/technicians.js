const express = require('express');
const { authenticateRole } = require('../auth');
const { requestFunctions, userFunctions } = require('../db');

const router = express.Router();

router.get('/:id/requests', authenticateRole(4, 3), async (req, res) => {
    try {
        const { id } = req.params;
        const requests = await requestFunctions.getByAssignedTechnician(id);
        res.status(200).json(requests);
    } catch (error) {
        console.error('Get requests by technician error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
router.post('/:id/requests/:idRequest/acknowledge', authenticateRole(4, 3), async (req, res) => {
    try {
        const { id, idRequest } = req.params;
        await requestFunctions.acknowledgeTechnician(idRequest, req.user.id);
        res.json({ message: 'Request acknowledged successfully' });
    } catch (error) {
        console.error('Acknowledge request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
router.post('/:id/requests/:idRequest/start', authenticateRole(4, 3), async (req, res) => {
    try {
        const { id, idRequest } = req.params;
        await requestFunctions.startTechnician(idRequest, req.user.id);
        res.json({ message: 'Request started successfully' });
    } catch (error) {
        console.error('Start request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
