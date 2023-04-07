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

    if (!req.body) {
        context.res = {
            status: 400,
            body: "Invalid request, missing body"
        };
        return;
    }

    if (!req.query.userId) {
        context.res = {
            status: 400,
            body: "Invalid request, missing userId"
        };
        return;
    }

    try {
        const boundary = multipart.getBoundary(req.headers["content-type"]);
        const parts = multipart.Parse(Buffer.from(req.body), boundary);

        const userId = hashUserId(req.query.userId);
        const file = parts[0];
        const fileName = file.filename;
        const mimeType = file.type;
        const imageBlobUrl = await uploadImage(file);

        // Create a DB record of the new image
        const container = await getDatabase();
        const image = {
            user: userId,
            imageBlobUrl: imageBlobUrl,
            fileName: fileName,
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