const express = require("express");
const app = express();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv").config();

aws.config.update({
  region: process.env.REGION,
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
});

const s3 = new aws.S3();
const BUCKET = process.env.BUCKET;
const upload = multer({
  storage: multerS3({
    bucket: BUCKET,
    s3: s3,
    acl: "public-read",
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

app.post("/upload", upload.single("file"), (req, resp) => {
  console.log(req.file);
  resp.send("Successfully Added" + req.file.location);
});

app.get("/list", async (req, resp) => {
  let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
  let list = r.Contents.map((data) => data.Key);
  resp.send({
    list,
  });
});

app.get("/download/:filename", async (req, resp) => {
  const fileName = req.params.filename;
  let result = await s3.getObject({ Bucket: BUCKET, Key: fileName }).promise();
  resp.send({
    data: result.Body,
  });
});

app.delete("/delete/:filename", async (req, resp) => {
  const fileName = req.params.filename;
  await s3.deleteObject({ Bucket: BUCKET, Key: fileName }).promise();
  resp.send({
    success: "Data Deleted SuccessFully",
    status: 200,
  });
});

app.listen(5001, () => console.log("Server Started 5001"));