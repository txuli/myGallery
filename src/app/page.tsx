import Hud from "./components/hud";
import mock from "../../public/vertical.jpg";
import { getPublicPhotos, type Photo } from "@/lib/immich";

// Foto local de prueba para cuando no hay ningún álbum público
const mockPhoto: Photo = {
  id: "mock",
  album: "test",
  lowSrc: mock.src,
  highSrc: mock.src,
  width: mock.width,
  height: mock.height,
  stats: { shutter: "1/50", aperture: "f/8", iso: "100", focal: "50mm", lens: "test", format: "ARW", megapixels: "23 MP" },
};

export default async function Home() {
  const photos = await getPublicPhotos();
  return (
    <>
    <Hud photos={photos.length ? photos : [mockPhoto]} />
    </>
  );
}
