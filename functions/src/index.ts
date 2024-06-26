import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

// sendgrid config
import * as sgMail from "@sendgrid/mail";

const API_KEY = functions.config().sendgrid.key;
const TEMPLATE_ID = functions.config().sendgrid.template;
sgMail.setApiKey(API_KEY);


// Functions
// Send wellcome email to the user
export const wellcomeEmail = functions.auth.user().onCreate(user=>{
  // Email
  const msg = {
    to: user.email,
    from: "ad.gaajal@gmail.com",
    templateId: TEMPLATE_ID,
    dynamic_template_data: {
      subject: "Wellcome to Sawari",
      name: user.displayName,
      text: "You have successfully created the sawari account!!",
    },
  };
  return sgMail.send(msg);
});

// Triger email when the new doucment is created in the ride_details collection

export const sendEmailOnNewRideBook = functions.firestore
  .document("ride_details/{rideId}")
  .onCreate(async (snap) => {
    // read the ride details
    const rideData = snap.data();
    const uid = rideData.uid;

    // read the user document
    const userDocRef = db.doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.log("Document does not exist!");
      return;
    }
    const userData = userDoc.data();
    if (!userData || !userData.email) {
      throw new Error("User data or email not available");
    }
    const userEmail = userData.email;


    // Email
    const msg = {
      to: userEmail,
      from: "ad.gaajal@gmail.com",
      templateId: TEMPLATE_ID,
      dynamic_template_data: {
        subject: "You booked a ride from SAWARI",
        name: rideData.pickuplocationname,
        text: "You have a ride confirm ride from sawari from " +
          `${rideData.pickuplocationname} ` +
          `to ${rideData.droplocationname}` +
          `using email ${userEmail}. Thank You`,
      },
    };
    return sgMail.send(msg);
  });

