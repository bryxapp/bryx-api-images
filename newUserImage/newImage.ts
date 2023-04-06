import { Context, HttpRequest } from "@azure/functions";
import { uploadImage } from "../utils/blobstorage";
import { getDatabase } from "../utils/database";
import { hashUserId } from "../utils/hash";
import * as multipart from "parse-multipart";

const newImage = async (context: Context, req: HttpRequest): Promise<void> => {
    if (!req.headers["content-type"] || !req.headers["content-type"].startsWith("multipart/form-data")) {
        context.res = {
            status: 400,
            body: "Invalid Content-Type"
        };
        return;
    }

    try {
        const boundary = multipart.getBoundary(req.headers["content-type"]);
        const parts = multipart.Parse(Buffer.from(req.body), boundary);

        const userIdPart = parts.find(part => part.name === "userId");
        const imagePart = parts.find(part => part.name === "image");

        if (!userIdPart || !imagePart) {
            context.res = {
                status: 400,
                body: "Invalid request, missing userId or image"
            };
            return;
        }

        const userId = hashUserId(userIdPart.data.toString());
        const mimeType = imagePart.type;
        const imageBlobUrl = await uploadImage(imagePart.data, imagePart.filename, mimeType);

        // Create a DB record of the new image
        const container = await getDatabase();
        const image = {
            userId: userId,
            imageBlobUrl: imageBlobUrl,
            mimeType: mimeType
        };

        const { resource: createdImage } = await container.items.create(image);

        context.res = {
            status: 201,
            body: createdImage
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: "Internal Server Error - " + err.message
        };
        return;
    }
};

export default newImage;