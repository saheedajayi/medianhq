"use server";

export async function verifyBackofficeAccessKey(accessKey: string) {
  const expectedAccessKey = process.env.BACKOFFICE_ACCESS_KEY;

  if (!expectedAccessKey) {
    return {
      success: false,
      message: "Access key is not configured.",
    };
  }

  if (accessKey.trim() !== expectedAccessKey) {
    return {
      success: false,
      message: "Invalid access key.",
    };
  }

  return {
    success: true,
  };
}
