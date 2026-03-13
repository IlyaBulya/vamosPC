import { useEffect, useMemo } from 'react';

export function useImagePreview(
    file: File | null,
    currentImage: string | null,
    removeImage: boolean,
) {
    const objectUrl = useMemo(() => {
        if (! file) {
            return null;
        }

        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    if (objectUrl) {
        return objectUrl;
    }

    return removeImage ? null : currentImage;
}
