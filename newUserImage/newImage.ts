import { Context, HttpRequest } from "@azure/functions";
import { uploadImage } from "../utils/blobstorage";
import { getDatabase } from "../utils/database";
import { hashUserId } from "../utils/hash";

const newImage = async (context: Context, req: HttpRequest): Promise<void> => {
    try {
        const newImage = req.body;

        // Validate there is a body and the body contains fields user, imageId, mimeType, and imageObj
        if (!newImage || !newImage.user || !newImage.imageObj || !newImage.mimeType) {
            context.res = {
                status: 400,
                body: "Please pass a valid image object in the request body",
            };
            return;
        }
        newImage.user = hashUserId(newImage.user);

        // Upload image to blob storage
        const imageBlobUrl = await uploadImage(newImage.imageObj, newImage.mimeType);

        // Add the blob url to the image object
        newImage.imageBlobUrl = imageBlobUrl;

        // Delete the imageObj from the image object
        delete newImage.imageObj;

        // Get the database
        const container = await getDatabase();

        // Create the image document
        const { resource: createdImage } = await container.items.create({ ...newImage });

        // Return the image document
        context.res = {
            status: 201,
            body: {
                msg: "Image created successfully.",
                id: createdImage.id,
                imageBlobUrl: createdImage.imageBlobUrl,
            },
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: error.message,
        };
    }
};

export default newImage;
