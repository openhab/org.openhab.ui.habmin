/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.persistence;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.core.items.ItemRegistry;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.eclipse.smarthome.ui.items.ItemUIRegistry;
import org.openhab.core.library.types.*;
import org.openhab.core.types.State;
import org.openhab.core.persistence.FilterCriteria;
import org.openhab.core.persistence.FilterCriteria.Ordering;
import org.openhab.core.persistence.HistoricItem;
import org.openhab.core.persistence.PersistenceService;
import org.openhab.core.persistence.QueryablePersistenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>
 * This class acts as a REST resource for history data and provides different
 * methods to interact with the, persistence store
 * 
 * <p>
 * The typical content types are plain text for status values and XML or JSON(P)
 * for more complex data structures
 * </p>
 * 
 * <p>
 * This resource is registered with the Jersey servlet.
 * </p>
 * 
 * @author Chris Jackson
 * @since 1.3.0
 */
@Path(PersistenceResource.PATH)
public class PersistenceResource implements RESTResource {

	private static final Logger logger = LoggerFactory.getLogger(PersistenceResource.class);

	/** The URI path to this resource */
	public static final String PATH = "habmin/persistence";

	static private Map<String, PersistenceService> persistenceServices = new HashMap<String, PersistenceService>();

	public void addPersistenceService(PersistenceService service) {
		persistenceServices.put(service.getName(), service);
	}

	public void removePersistenceService(PersistenceService service) {
		persistenceServices.remove(service.getName());
	}
	
	static public Map<String, PersistenceService> getPersistenceServices() {
		return persistenceServices;
	}
	
	static private ItemUIRegistry itemUIRegistry;

	public void setItemUIRegistry(ItemUIRegistry itemUIRegistry) {
		PersistenceResource.itemUIRegistry = itemUIRegistry;
	}

	public void unsetItemUIRegistry(ItemRegistry itemUIRegistry) {
		PersistenceResource.itemUIRegistry = null;
	}

	static public ItemUIRegistry getItemUIRegistry() {
		return itemUIRegistry;
	}

	
	@Context
	UriInfo uriInfo;

	@GET
	@Produces({ MediaType.APPLICATION_JSON })
	public Response httpGetPersistenceServices(@Context HttpHeaders headers,
			@QueryParam("jsoncallback") @DefaultValue("callback") String callback) {
		logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

		Object responseObject = getPersistenceServiceList();
		return Response.ok(responseObject).build();
	}

	@GET
	@Path("/{servicename: [a-zA-Z_0-9]*}/{itemname: [a-zA-Z_0-9]*}")
	@Produces({ MediaType.APPLICATION_JSON })
	public Response httpGetPersistenceItemData(@Context HttpHeaders headers,
			@PathParam("servicename") String serviceName, @PathParam("itemname") String itemName,
			@QueryParam("starttime") String startTime, @QueryParam("endtime") String endTime,
			@QueryParam("page") long pageNumber, @QueryParam("pagelength") long pageLength,
			@QueryParam("jsoncallback") @DefaultValue("callback") String callback) {
		logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

		final Object responseObject = getItemHistoryBean(serviceName, itemName, startTime, endTime);
		return Response.ok(responseObject).build();
	}

	Date convertTime(String sTime) {
		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss");

		// replace with your start date string
		Date dateTime;
		try {
			dateTime = df.parse(sTime);
		} catch (ParseException e) {
			// Time doesn't parse as string - try long
			long lTime = Long.parseLong(sTime, 10);
			dateTime = new Date(lTime);
		}

		return dateTime;
	}
	
	static public org.eclipse.smarthome.core.items.Item getItem(String itemname) {
		ItemUIRegistry registry = getItemUIRegistry();
		if (registry != null) {
			try {
				org.eclipse.smarthome.core.items.Item item = registry.getItem(itemname);
				return item;
			} catch (org.eclipse.smarthome.core.items.ItemNotFoundException e) {
				logger.debug(e.getMessage());
			}
		}
		return null;
	}

	private ItemHistoryBean getItemHistoryBean(String serviceName, String itemName, String timeBegin, String timeEnd) {
		PersistenceService service = (PersistenceService) getPersistenceServices().get(serviceName);

		long timerStart = System.currentTimeMillis();

		if (service == null) {
			logger.debug("Persistence service not found '{}'.", serviceName);
			throw new WebApplicationException(404);
		}

		if (!(service instanceof QueryablePersistenceService)) {
			logger.debug("Persistence service not queryable '{}'.", serviceName);
			throw new WebApplicationException(404);
		}

		org.eclipse.smarthome.core.items.Item item = getItem(itemName);
		if (item == null) {
			logger.info("Received HTTP GET request at '{}' for the unknown item '{}'.", uriInfo.getPath(), itemName);
			throw new WebApplicationException(404);
		}

		QueryablePersistenceService qService = (QueryablePersistenceService) service;

		Date dateTimeBegin = new Date();
		Date dateTimeEnd = dateTimeBegin;
		if (timeBegin != null) {
			dateTimeBegin = convertTime(timeBegin);
		}

		if (timeEnd != null) {
			dateTimeEnd = convertTime(timeEnd);
		}

		// End now...
		if (dateTimeEnd.getTime() == 0) {
			dateTimeEnd = new Date();
		}
		if (dateTimeBegin.getTime() == 0) {
			dateTimeBegin = new Date(dateTimeEnd.getTime() - 86400000);
		}

		// Default to 1 days data if the times are the same
		if (dateTimeBegin.getTime() >= dateTimeEnd.getTime()) {
			dateTimeBegin = new Date(dateTimeEnd.getTime() - 86400000);
		}

		FilterCriteria filter = new FilterCriteria();
		Iterable<HistoricItem> result;
		State state = null;

		Long quantity = 0l;
		double average = 0;
		Double minimum = null;
		Double maximum = null;
		Date timeMinimum = null;
		Date timeMaximum = null;

		ItemHistoryBean bean = null;
		bean = new ItemHistoryBean();

		bean.name = item.getName();

		// First, get the value at the start time.
		// This is necessary for values that don't change often otherwise data
		// will start
		// after the start of the graph (or not at all if there's no change
		// during the graph period)
		filter = new FilterCriteria();
		filter.setEndDate(dateTimeBegin);
		filter.setItemName(item.getName());
		filter.setPageSize(1);
		filter.setOrdering(Ordering.DESCENDING);
		result = qService.query(filter);
		if (result != null && result.iterator().hasNext()) {
			HistoricItem historicItem = result.iterator().next();

			double value = bean.addData(dateTimeBegin.getTime(), historicItem.getState());

			average += value;
			quantity++;

			minimum = value;
			timeMinimum = historicItem.getTimestamp();

			maximum = value;
			timeMaximum = historicItem.getTimestamp();
		}

		filter.setBeginDate(dateTimeBegin);
		filter.setEndDate(dateTimeEnd);
		filter.setOrdering(Ordering.ASCENDING);
		filter.setPageSize(Integer.MAX_VALUE);

		result = qService.query(filter);
		if(result != null) {
			Iterator<HistoricItem> it = result.iterator();

			// Iterate through the data
			while (it.hasNext()) {
				HistoricItem historicItem = it.next();
				state = historicItem.getState();

				// For 'binary' states, we need to replicate the data
				// to avoid diagonal lines
				if(state instanceof OnOffType || state instanceof OpenClosedType) {
					bean.addData(historicItem.getTimestamp().getTime(), state);
				}

				double value = bean.addData(historicItem.getTimestamp().getTime(), state);

				average += value;
				quantity++;

				if (minimum == null || value < minimum) {
					minimum = value;
					timeMinimum = historicItem.getTimestamp();
				}

				if (maximum == null || value > maximum) {
					maximum = value;
					timeMaximum = historicItem.getTimestamp();
				}
			}

			// Add the last value again at the end time
			if(state != null) {
				average += bean.addData(dateTimeEnd.getTime(), state);
				quantity++;
			}
		}

		bean.datapoints = Long.toString(quantity);
		if (quantity > 0) {
			bean.stateavg = Double.toString(average / quantity);
		}

		if (minimum != null) {
			bean.statemin = minimum.toString();
			bean.timemin = Long.toString(timeMinimum.getTime());
		}

		if (maximum != null) {
			bean.statemax = maximum.toString();
			bean.timemax = Long.toString(timeMaximum.getTime());
		}

		bean.type = item.getClass().getSimpleName();

		long timerStop = System.currentTimeMillis();
		logger.debug("CHART: returned {} rows in {}ms", bean.datapoints, timerStop - timerStart);

		return bean;
	}

	/**
	 * Gets a list of persistence services currently configured in the system
	 * 
	 * @return
	 */
	private List<ServiceBean> getPersistenceServiceList() {
		List<ServiceBean> beanList = new ArrayList<ServiceBean>();

		for (Map.Entry<String, PersistenceService> service : getPersistenceServices().entrySet()) {
			ServiceBean serviceBean = new ServiceBean();
			serviceBean.name = service.getKey();

			beanList.add(serviceBean);
//			serviceBean.name = service.getKey();
//			serviceBean.actions = new ArrayList<String>();

//			serviceBean.actions.add("Create");
//			if (service.getValue() instanceof QueryablePersistenceService)
//				serviceBean.actions.add("Read");
			// if (service.getValue() instanceof CRUDPersistenceService) {
			// serviceBean.actions.add("Update");
			// serviceBean.actions.add("Delete");
			// }

//			beanList.add(serviceBean);
		}

		return beanList;
	}
}
