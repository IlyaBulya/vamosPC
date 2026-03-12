import { useEffect, useState } from 'react';

export function useImagePreview(
    file: File | null,
    currentImage: string | null,
    removeImage: boolean,
) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        removeImage ? null : currentImage,
    );

    useEffect(() => {
        if (! file) {
            setPreviewUrl(removeImage ? null : currentImage);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [currentImage, file, removeImage]);

    return previewUrl;
}
