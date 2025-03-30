import ProjectSettings from "../model/projectSettings.js";

const projectSettingsController = {
  async updateSettings(req, res) {
    try {
      const { feeAddress, feePercentage } = req.body;
      
      // Deactivate current active settings
      await ProjectSettings.updateMany(
        { active: true },
        { active: false }
      );

      // Create new settings
      const settings = await ProjectSettings.create({
        feeAddress,
        feePercentage,
        lastModifiedBy: req.user.id,
        active: true
      });

      res.status(200).json({
        message: 'Settings updated successfully',
        settings
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating settings' });
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await ProjectSettings.findOne({ active: true })
        .populate('lastModifiedBy', 'name email');

      if (!settings) {
        return res.status(404).json({ message: 'No active settings found' });
      }

      res.status(200).json({ settings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching settings' });
    }
  },

  async getSettingsHistory(req, res) {
    try {
      const history = await ProjectSettings.find({})
        .sort({ createdAt: -1 })
        .populate('lastModifiedBy', 'name email');

      res.status(200).json({ history });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching settings history' });
    }
  }
};

export default projectSettingsController;