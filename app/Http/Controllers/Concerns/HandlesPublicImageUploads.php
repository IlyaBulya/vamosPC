<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandlesPublicImageUploads
{
    protected function storePublicImage(UploadedFile $image, string $directory): string
    {
        return Storage::url($image->store($directory, 'public'));
    }

    protected function copyPublicImage(?string $image, string $directory): ?string
    {
        $relativePath = $this->publicImageRelativePath($image);

        if ($relativePath === null || ! Storage::disk('public')->exists($relativePath)) {
            return $image;
        }

        $extension = pathinfo($relativePath, PATHINFO_EXTENSION);
        $targetPath = trim($directory, '/').'/'.Str::uuid()->toString();

        if ($extension !== '') {
            $targetPath .= '.'.$extension;
        }

        Storage::disk('public')->copy($relativePath, $targetPath);

        return Storage::url($targetPath);
    }

    protected function deletePublicImage(?string $image): void
    {
        $relativePath = $this->publicImageRelativePath($image);

        if ($relativePath === null) {
            return;
        }

        Storage::disk('public')->delete($relativePath);
    }

    protected function publicImageRelativePath(?string $image): ?string
    {
        if (! is_string($image) || $image === '') {
            return null;
        }

        if (Str::startsWith($image, '/storage/')) {
            return Str::after($image, '/storage/');
        }

        if (Str::startsWith($image, 'storage/')) {
            return Str::after($image, 'storage/');
        }

        return null;
    }
}
