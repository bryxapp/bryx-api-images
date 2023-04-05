import { BlobServiceClient } from "@azure/storage-blob";
import config from "./config.json";

export const uploadImage = async (imageBuffer: Buffer, mimeType: string) => {
    // Upload the Image to blob storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    const containerName = config.BLOB.containerName;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const imageName = `image-${new Date().getTime()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(imageName);

    // Upload data to the blob
    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
        blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
};



export const deleteImageBlob = async (imageUrl: string) => {
    // Delete the PDF from blob storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

    const containerName = config.BLOB.containerName;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    let blobName = decodeURI(imageUrl.split("/").pop());
    blobName = blobName.replace(/%20/g, " ");
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Delete the blob
    await blockBlobClient.delete();
}