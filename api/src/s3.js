import _ from "lodash";
import { s3Bucket } from "./config";

export default class S3 {
  constructor(app, response) {
    this.app = app;
    this.response = response;
    this.s3 = app.s3;
    this.bucket = s3Bucket;
  }

  getObject(file) {
    const s3 = this.app.s3;

    const options = {
      Bucket: s3Bucket,
      Key: _.get(file, "name"),
    };

    return s3.getObject(options).createReadStream();
  }

  download(file) {
    const s3 = this.app.s3;
    const response = this.response;

    const filename = _.get(file, "originalName");
    response.attachment(filename);

    const options = {
      Bucket: s3Bucket,
      Key: _.get(file, "name"),
    };
    const fileObject = s3.getObject(options).createReadStream();

    fileObject.pipe(response);
  }

  /**
   * Get file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Buffer>} File data
   */
  async getFile(key) {
    const params = {
      Bucket: this.bucket,
      Key: key
    };

    return new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) {
          console.error("Error getting file from S3:", err);
          reject(err);
        } else {
          resolve(data.Body);
        }
      });
    });
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    const params = {
      Bucket: this.bucket,
      Key: key
    };

    return new Promise((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting file from S3:", err);
          reject(err);
        } else {
          console.log("File deleted from S3:", key);
          resolve(data);
        }
      });
    });
  }

  getDownloadUrl(file) {
    const s3 = this.app.s3;
    const options = {
      Bucket: s3Bucket,
      Key: _.get(file, "name"),
      Expires: 3600,
    };

    const url = s3.getSignedUrl("getObject", options);

    return url;
  }

  /**
   * Get signed URL for temporary access
   * @param {string} key - S3 object key
   * @param {number} expires - URL expiry in seconds (default 3600)
   * @returns {string} Signed URL
   */
  getSignedUrl(key, expires = 3600) {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expires
    };

    return this.s3.getSignedUrl('getObject', params);
  }
}
