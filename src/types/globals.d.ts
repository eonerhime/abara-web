interface CustomJwtSessionClaims {
  publicMetadata: {
    businessId?: string;
    profileComplete?: boolean;
    phoneNumberId?: string | null;
  };
}
