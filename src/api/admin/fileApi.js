import request from "@/utils/request";

export function uploadAdminImage(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  return request({
    url: "/files/image",
    method: "post",
    data: formData,
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
}
