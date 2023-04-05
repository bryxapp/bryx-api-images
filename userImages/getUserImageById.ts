import { Context, HttpRequest } from "@azure/functions";
import { getDatabase } from "../utils/database";

const getUserImageById = async (context: Context, req: HttpRequest): Promise<void> => {
    try {
        const imageId = req.params.imageId;

        // Validate the Estimate ID
        if (!imageId) {
            context.res = {
                status: 400,
                body: "Image ID is required."
            };
            return;
        }

        // Get the database
        const container = await getDatabase();

        const { resource: image } = await container.item(imageId, undefined).read();

        if (!image) {
            context.res = {
                status: 404,
                body: "Image not found."
            };
            return;
        }

        context.res = {
            status: 200,
            body: image
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: error.message
        };
    }
};

export default getUserImageById;