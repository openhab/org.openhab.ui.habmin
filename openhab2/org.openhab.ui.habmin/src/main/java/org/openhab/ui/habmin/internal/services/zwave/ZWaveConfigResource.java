/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.zwave;


import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
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
//import org.openhab.binding.zwave.internal.config.OpenHABConfigurationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>This class acts as a REST resource for items and provides different methods to interact with them,
 * like retrieving lists of items, sending commands to them or checking a single status.</p>
 * 
 * <p>The typical content types are plain text for status values and XML or JSON(P) for more complex data
 * structures</p>
 * 
 * <p>This resource is registered with the Jersey servlet.</p>
 *
 * @author Chris Jackson
 * @since 1.4.0
 */
//@Path(ZWaveConfigResource.PATH)
public class ZWaveConfigResource implements RESTResource {
/*
	private static final Logger logger = LoggerFactory.getLogger(ZWaveConfigResource.class); 
	
	// The URI path to this resource
    public static final String PATH = "zwave";

    static private Map<String, OpenHABConfigurationService> configurationServices = new HashMap<String, OpenHABConfigurationService>();
    
	static void addConfigurationService(OpenHABConfigurationService service) {
		configurationServices.put(service.getCommonName(), service);
	}

	static public Map<String, OpenHABConfigurationService> getConfigurationServices() {
		return configurationServices;
	}

	static void removeConfigurationService(OpenHABConfigurationService service) {
		configurationServices.remove(service.getCommonName());
	}

	@Context UriInfo uriInfo;
	@GET
	@Path("{domain: .+}")
    @Produces( { MediaType.WILDCARD })
    public Response getConfig(
    		@Context HttpHeaders headers,
    		@QueryParam("type") String type,
    		@PathParam("domain") String domain,
    		@QueryParam("jsoncallback") @DefaultValue("callback") String callback) {
		logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

		OpenHABConfigurationService cfg = getConfigurationServices().get("ZWave");

		if(cfg == null)
			return Response.notAcceptable(null).build();

		ConfigServiceListBean cfgList = new ConfigServiceListBean();
		cfgList.records = cfg.getConfiguration(domain);

    	Object responseObject = cfgList;
    	return Response.ok(responseObject).build();
    }

	@PUT
	@Path("action/{domain: .+}")
    @Produces( { MediaType.WILDCARD })
    public Response putAction(
    		@Context HttpHeaders headers,
    		@QueryParam("type") String type,
    		@PathParam("domain") String domain,
    		@QueryParam("jsoncallback") @DefaultValue("callback") String callback, String action) {
		logger.trace("Received HTTP PUT request at '{}'.", uriInfo.getPath());

		OpenHABConfigurationService cfg = getConfigurationServices().get("ZWave");

		if(cfg == null)
			return Response.notAcceptable(null).build();

		cfg.doAction(domain, action);
		
		ConfigServiceListBean cfgList = new ConfigServiceListBean();

    	Object responseObject = cfgList;
    	return Response.ok(responseObject).build();
    }

	@PUT
	@Path("set/{domain: .+}")
    @Produces( { MediaType.WILDCARD })
    public Response putSet(
    		@Context HttpHeaders headers,
    		@QueryParam("type") String type,
    		@PathParam("domain") String domain,
    		@QueryParam("jsoncallback") @DefaultValue("callback") String callback, String set) {
		logger.trace("Received HTTP PUT request at '{}'.", uriInfo.getPath());

		OpenHABConfigurationService cfg = getConfigurationServices().get("ZWave");

		if(cfg == null)
			return Response.notAcceptable(null).build();

		cfg.doSet(domain, set);
		
		ConfigServiceListBean cfgList = new ConfigServiceListBean();

    	Object responseObject = cfgList;
    	return Response.ok(responseObject).build();
    }
	
	*/
}
