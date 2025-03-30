import db from "../config/db.js";

const projectSettingsSchema = new db.Schema(
  {
    feeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    feePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lastModifiedBy: {
      type: db.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "projectSettings"
  }
);

const ProjectSettings = db.model("ProjectSettings", projectSettingsSchema);
ProjectSettings.syncIndexes().catch((e) => console.log(e));

export default ProjectSettings;