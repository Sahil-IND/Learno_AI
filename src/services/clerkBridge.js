// Bridges Clerk (a React hook) to the plain API layer.
// ClerkBridge registers these functions once Clerk has loaded.
let tokenGetter = null;
let signOutFn = null;

export const registerClerk = ({ getToken, signOut }) => {
  tokenGetter = getToken;
  signOutFn = signOut;
};

// Returns a fresh Clerk session token, or null when nobody is signed in
export const getClerkToken = async () => {
  if (!tokenGetter) return null;
  try {
    return (await tokenGetter()) || null;
  } catch (error) {
    return null;
  }
};

export const clerkSignOut = async () => {
  if (signOutFn) await signOutFn();
};
