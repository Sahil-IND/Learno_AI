const InstructorApplication = require("../models/InstructorApplication");

// An instructor is approved only when the account is marked Instructor AND the
// application for the same email has been approved by an admin. Both must hold,
// so a stale account type alone never opens the teacher tools.
const applicationStatusFor = async (email) => {
  const application = await InstructorApplication.findOne({
    email: String(email || "").trim().toLowerCase(),
  })
    .select("status")
    .lean();
  return application?.status || "none";
};

// Fields the frontend uses to decide whether to show the teacher dashboard
const instructorFieldsFor = async (user) => {
  const applicationStatus = await applicationStatusFor(user.email);
  return {
    instructorApplicationStatus: applicationStatus,
    instructorApproved: user.accountType === "Instructor" && applicationStatus === "approved",
  };
};

module.exports = { applicationStatusFor, instructorFieldsFor };
