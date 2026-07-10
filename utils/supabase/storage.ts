import { createClient } from "@/utils/supabase/client";

// Chỉ cho phép ảnh, giới hạn dung lượng để tránh lạm dụng bucket public.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadGalleryImage(file: File): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validate loại file và dung lượng trước khi upload
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        url: null,
        error: new Error("Định dạng file không hợp lệ. Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF."),
      };
    }

    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return {
        url: null,
        error: new Error("Phần mở rộng file không hợp lệ."),
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        error: new Error("Kích thước file vượt quá 10MB."),
      };
    }

    const supabase = createClient();

    // Generate a unique filename using timestamp and a random string
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { url: null, error: error as Error };
  }
}
