package org.openhab.ui.habmin.internal.services.floorplan;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.habmin.HABminConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.StaxDriver;

@Path(FloorplanResource.PATH)
public class FloorplanResource implements RESTResource {

    /** The URI path to this resource */
    public static final String PATH = "habmin/floorplan";
    
    private static String FLOORPLAN_FILE = "floorplans.xml";

    private static final Logger logger = LoggerFactory.getLogger(FloorplanResource.class);

    @Context
    UriInfo uriInfo;

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetFloorplans(@Context HttpHeaders headers,
            @QueryParam("jsoncallback") @DefaultValue("callback") String callback) {
        logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getFloorplanList();
        return Response.ok(responseObject).build();
    }

    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPostFloorplans(@Context HttpHeaders headers,
            @QueryParam("jsoncallback") @DefaultValue("callback") String callback, FloorplanConfigBean floorplan) {
        logger.trace("Received HTTP POST request at '{}'.", uriInfo.getPath());

        Object responseObject = putFloorplanBean(0, floorplan);
        return Response.ok(responseObject).build();
    }

    @GET
    @Path("/{floorplanID: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetFloorplans(@Context HttpHeaders headers,
            @QueryParam("jsoncallback") @DefaultValue("callback") String callback, @PathParam("floorplanID") Integer floorplanID) {
        logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getFloorplan(floorplanID);
        return Response.ok(responseObject).build();
    }
    
    @PUT
    @Path("/{floorplanID: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPutFloorplans(@Context HttpHeaders headers,
            @QueryParam("jsoncallback") @DefaultValue("callback") String callback,
            @PathParam("floorplanID") Integer floorplanID, FloorplanConfigBean floorplan) {
        logger.trace("Received HTTP PUT request at '{}'.", uriInfo.getPath());

        Object responseObject = putFloorplanBean(floorplanID, floorplan);
        return Response.ok(responseObject).build();
    }

    @DELETE
    @Path("/{floorplanID: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpDeleteFloorplan(@Context HttpHeaders headers, @QueryParam("type") String type,
            @QueryParam("jsoncallback") @DefaultValue("callback") String callback, @PathParam("floorplanID") Integer floorplanID) {
        logger.trace("Received HTTP DELETE request at '{}'.", uriInfo.getPath());

        Object responseObject = deleteFloorplan(floorplanID);
        return Response.ok(responseObject).build();
    }
    
    
    
    
    
    
    
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

        
        File folder = new File(HABminConstants.getDataDirectory());
        // Create path.
        if (!folder.exists()) {
            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }
        
        File file = new File(folder + "/floorplan-" + floorplanID + ".jpg");
        
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

    
    
    
    
    
    private FloorplanConfigBean putFloorplanBean(Integer floorplanRef, FloorplanConfigBean bean) {
        if (floorplanRef == 0) {
            bean.id = null;
        } else {
            bean.id = floorplanRef;
        }

        // Load the existing list
        FloorplanListBean list = loadFloorplans();

        int high = 0;

        FloorplanConfigBean foundFloorplan = null;
        // Loop through the interface list
        for (FloorplanConfigBean i : list.entries) {
            if (i.id > high)
                high = i.id;
            if (i.id.intValue() == floorplanRef) {
                // If it was found in the list, remember it...
                foundFloorplan = i;
            }
        }

        // If it was found in the list, remove it...
        if (foundFloorplan != null) {
            list.entries.remove(foundFloorplan);
        }

        // Set defaults if this is a new floorplan
        if (bean.id == null) {
            bean.id = high + 1;
        }

        // Now save the updated version
        list.entries.add(bean);
        saveFloorplans(list);

        return bean;
    }

    private List<FloorplanConfigBean> getFloorplanList() {
        FloorplanListBean floorplans = loadFloorplans();
//      FloorplanListBean newList = new FloorplanListBean();
        List<FloorplanConfigBean> list = new ArrayList<FloorplanConfigBean>();

        // We only want to return the id and name
        for (FloorplanConfigBean i : floorplans.entries) {
            FloorplanConfigBean newFloorplan = new FloorplanConfigBean();
            newFloorplan.id = i.id;
            newFloorplan.name = i.name;
            newFloorplan.category = i.category;

            list.add(newFloorplan);
        }

        return list;
    }

    private FloorplanConfigBean getFloorplan(Integer floorplanRef) {
        FloorplanListBean floorplans = loadFloorplans();

        for (FloorplanConfigBean i : floorplans.entries) {
            if (i.id.intValue() == floorplanRef)
                return i;
        }

        return null;
    }

    private List<FloorplanConfigBean> deleteFloorplan(Integer floorplanRef) {
        FloorplanListBean floorplans = loadFloorplans();

        FloorplanConfigBean foundFloorplan = null;
        for (FloorplanConfigBean i : floorplans.entries) {
            if (i.id.intValue() == floorplanRef) {
                // If it was found in the list, remember it...
                foundFloorplan = i;
                break;
            }
        }

        // If it was found in the list, remove it...
        if (foundFloorplan != null) {
            floorplans.entries.remove(foundFloorplan);
        }

        saveFloorplans(floorplans);

        return getFloorplanList();
    }

    private boolean saveFloorplans(FloorplanListBean floorplan) {
        File folder = new File(HABminConstants.getDataDirectory());
        // create path for serialization.
        if (!folder.exists()) {
            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }

        try {
            long timerStart = System.currentTimeMillis();
            
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(HABminConstants.getDataDirectory() + FLOORPLAN_FILE),"UTF-8"));

            XStream xstream = new XStream(new StaxDriver());
            xstream.alias("floorplans", FloorplanListBean.class);
            xstream.alias("floorplan", FloorplanConfigBean.class);
            xstream.alias("hotspot", FloorplanHotspotConfigBean.class);
            xstream.processAnnotations(FloorplanListBean.class);

            xstream.toXML(floorplan, out);

            out.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Floorplan list saved in {}ms.", timerStop - timerStart);
        } catch (FileNotFoundException e) {
            logger.debug("Unable to open Floorplan list for SAVE - ", e);

            return false;
        } catch (IOException e) {
            logger.debug("Unable to write Floorplan list for SAVE - ", e);

            return false;
        }

        return true;
    }

    private FloorplanListBean loadFloorplans() {
        FloorplanListBean floorplans = null;

        FileInputStream fin;
        try {
            long timerStart = System.currentTimeMillis();

            fin = new FileInputStream(HABminConstants.getDataDirectory() + FLOORPLAN_FILE);

            XStream xstream = new XStream(new StaxDriver());
            xstream.alias("floorplans", FloorplanListBean.class);
            xstream.alias("floorplan", FloorplanConfigBean.class);
            xstream.alias("hotspot", FloorplanHotspotConfigBean.class);
            xstream.processAnnotations(FloorplanListBean.class);

            floorplans = (FloorplanListBean) xstream.fromXML(fin);

            fin.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Floorplans loaded in {}ms.", timerStop - timerStart);

        } catch (FileNotFoundException e) {
            floorplans = new FloorplanListBean();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return floorplans;
    }
    
    
    
}