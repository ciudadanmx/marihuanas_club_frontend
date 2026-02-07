/**
 * FotosPreview
 * - Presenta los previews base64 de las imágenes subidas en el formulario
 */
import {
  Stack,
  Avatar,
} from "@mui/material";

export default function FotosPreview({ previews }) {
  if (!previews || previews.length === 0) return null;
  return (
    <Stack direction="row" spacing={1}>
      {previews.map((src, i) => (
        <Avatar key={i} src={src} variant="rounded" sx={{ width: 64, height: 64, borderRadius: 1 }} />
      ))}
    </Stack>
  );
}