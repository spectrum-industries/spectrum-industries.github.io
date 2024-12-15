import { lusitana } from '@/app/ui/fonts';
import { fetchPhotosDimensions, fetchRandomPhoto, fetchTestLandscapePhoto, fetchTestPortraitPhoto } from '@/app/lib/data';
import Image from 'next/image';

export default async function RandomPhoto() {
  const randomPhoto = await fetchRandomPhoto();
  // console.log('RANDOM PHOTO', randomPhoto);
  // const landscapePhoto = await fetchTestLandscapePhoto()
  // const dimensions = await fetchPhotosDimensions()
  // const portraitPhoto = await fetchTestPortraitPhoto()

  const classifyImage = (width: number, height: number) => {
    const aspectRatio = width / height;
    if (aspectRatio > 1.2) return 'landscape';
    if (aspectRatio < 0.8) return 'portrait';
    return 'square';
  };
  const imageClass = classifyImage(randomPhoto?.width, randomPhoto?.height);

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Random Picture we have taken
      </h2>
        <div
          className={`rounded-xl bg-gray-50 p-5 flex justify-center items-center ${imageClass}`}
          style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
        >
              <Image 
                src={randomPhoto?.photo}
                alt={randomPhoto?.id}
                width={randomPhoto?.width}
                height={randomPhoto?.height}
                className="rounded"
                style={{ objectFit: 'contain' }}
              />
          </div>
    </div>
  );
}
