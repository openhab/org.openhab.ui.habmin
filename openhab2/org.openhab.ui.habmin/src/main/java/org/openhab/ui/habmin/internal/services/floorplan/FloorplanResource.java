package org.openhab.ui.habmin.internal.services.floorplan;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.imageio.ImageIO;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.habmin.HABminConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path(FloorplanResource.PATH)
public class FloorplanResource implements RESTResource {

    /** The URI path to this resource */
    public static final String PATH = "habmin/floorplan";
    
    private static final String FLOORPLAN_FOLDER = "floorplan/";

    private static final Logger logger = LoggerFactory.getLogger(FloorplanResource.class);

    @Context
    UriInfo uriInfo;

    /**
     * Upload a File
     * @return 
     */
/*
    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(
            //@FormDataParam("file") InputStream fileInputStream,
            //@FormDataParam("file") FormDataContentDisposition contentDispositionHeader
            ) {

        File folder = new File(HABminConstants.getDataDirectory());
        // create path for serialization.
        if (!folder.exists()) {
//            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }

        String filePath = folder + contentDispositionHeader.getFileName();

        // save the file to the server
        saveFile(fileInputStream, filePath);

        String output = "File saved to server location : " + filePath;

        return Response.status(200).entity(output).build();
    }*/

    @GET
    @Produces({"image/jpeg"})
    @Path("/{floorplanID: [0-9]*}/image")
    public Response doGetImage(@Context HttpHeaders headers,
            @PathParam("floorplanID") String floorplanID) {

//        if (req.getDateHeader("If-Modified-Since") > startupTime) {
//            resp.setStatus(304);
 //           return;
   //     }

        
        File folder = new File(HABminConstants.getDataDirectory() + FLOORPLAN_FOLDER);
        // Create path.
        if (!folder.exists()) {
            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }
        
        File file = new File(folder + "/" + floorplanID + ".jpg");
        
        return Response.ok((Object) file).build();
        
/*
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        BufferedImage img = null;
        try {
            img = ImageIO.read(new File(folder + "/" + floorplanID + ".jpg"));
        } catch (IOException e) {
        }
        
//        byte[] imageData = baos.toByteArray();

        // uncomment line below to send non-streamed
        return Response.ok(imageData).build();
        */
//        return Response.ok(img).header("", "").build();

//            if (provider.hasIcon(iconName)) {
        //        resp.setContentType("image/jpg");
//                resp.setDateHeader("Last-Modified", new Date().getTime());
      //          ServletOutputStream os = resp.getOutputStream();
    //            InputStream is = new FileInputStream(new File(floorplanID + ".jpg"));
  //              IOUtils.copy(is, os);
//                resp.flushBuffer();

//            }

//        resp.sendError(404);
    }

    // save uploaded file to a defined location on the server
    private void saveFile(InputStream uploadedInputStream,
            String serverLocation) {

        try {
            OutputStream outpuStream = new FileOutputStream(new File(serverLocation));
            int read = 0;
            byte[] bytes = new byte[1024];

            outpuStream = new FileOutputStream(new File(serverLocation));
            while ((read = uploadedInputStream.read(bytes)) != -1) {
                outpuStream.write(bytes, 0, read);
            }
            outpuStream.flush();
            outpuStream.close();
        } catch (IOException e) {

            e.printStackTrace();
        }

    }

}