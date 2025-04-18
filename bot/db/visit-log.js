const mongoose = require('mongoose');

const visitLogSchema = new mongoose.Schema({
  sl_no: { type: String, required: true },
  phone: { type: String, required: true }, // volunteer's number
  volunteerName: { type: String },         // e.g. Prabhati Maa
  role: { type: String },                  // e.g. Field Worker, Ritwick, etc.

  status: { type: String, enum: ['inactive', 'continuing', 'discontinued', 'returned'], required: true },

  // All optional based on path
  reason: { type: String },
  reasonOfDeath: { type: String },
  comment: { type: String },
  familyCode: { type: String },
  phoneOfMember: { type: String },
  landmark: { type: String },

  // Discontinued extensions
  needsHelp: { type: Boolean },
  helpType: { type: String }, // financial, health, job
  jobInfo: {
    study: String,
    jobType: String,
    jobLocation: String
  },

  // Return flags
  returnFlag: { type: Boolean },
  returnStatus: { type: String }, // resumed / thinking / not yet
  returnComments: { type: String },

  dpAppUpdateByVolunteer: { type: String }, // "yes", "no", "not sure"

  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VisitLog', visitLogSchema);
