import { Context, HttpRequest } from "@azure/functions";
import { getDatabase } from "../utils/database";
import { deleteImageBlob } from "../utils/blobstorage";

const deleteImage = async (context: Context, req: HttpRequest): Promise<void> => {
    try {
        const imageId = req.params.imageId;

        // Validate the estimate ID
        if (!imageId) {
            context.res = {
                status: 400,
                body: "Image ID is required."
            };
            return;
        }

        //Get the database connection
        const container = await getDatabase();

        //Fetch the image
        const { resource: image } = await container.item(imageId, undefined).read();

        //Delete the image blob from blob storage
        await deleteImageBlob(image.imageBlobUrl);

        //Delete the image from Cosmos DB
        await container.item(imageId, undefined).delete();

        context.res = {
            status: 200,
            body: "Image deleted successfully."
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: error.message
        };
    }
};

export default deleteImage;