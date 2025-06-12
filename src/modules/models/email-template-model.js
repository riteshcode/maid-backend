const mongoose = require("mongoose");

const EmailTemplateServiceSchema = new mongoose.Schema(
  {
    template_name: {
      type: String,
      required: true,
    },
    template_key: {
      type: String,
      required: true,
      unique: true
    },
    template_content: {
      type: String,
      required: true,
    },
    template_notes: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Middleware to exclude soft-deleted records from all queries
// EmailTemplateServiceSchema.pre(/^find/, function (next) {
//   this.where({ isDeleted: false });
//   next();
// });

module.exports = mongoose.model("EmailTemplate", EmailTemplateServiceSchema);
