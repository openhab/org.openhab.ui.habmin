/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.persistence;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import org.openhab.core.library.types.DecimalType;
import org.openhab.core.library.types.OnOffType;
import org.openhab.core.library.types.OpenClosedType;
import org.openhab.core.types.State;
import org.openhab.ui.habmin.internal.services.chart.ChartResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;




/**
 * This is a java bean that is used with JAXB to serialize items
 * to XML or JSON.
 *  
 * @author Chris Jackson
 * @since 1.3.0
 *
 */
@XmlRootElement(name="history")
public class ItemHistoryBean {

	public String name;
	public String type;
	public String totalrecords;
	public String link;

	public String icon;
	public String label;
	public String units;
	public String format;
	public String map;
	
	public List<String> groups;
	public List<String> services;	
	
	public String timestart;
	public String timeend;
	public String statemax;
	public String timemax;
	public String statemin;
	public String timemin;
	public String stateavg;
	public String datapoints;

	public List<HistoryDataBean> data;
	
	public ItemHistoryBean() {};
	private static final Logger logger = LoggerFactory.getLogger(ChartResource.class);

	public double addData(Long time, State state) {
//		logger.debug("addData: {}  {}  {}", time, state.toString(), state.getClass());
		if(data == null) {
			data = new ArrayList<HistoryDataBean>();
		}

		double value;
		if (state instanceof DecimalType) {
			value = ((DecimalType) state).doubleValue();				
		}
		else if(state instanceof OnOffType) {
			if(state == OnOffType.OFF) {
				value = 0;
			}
			else {
				value = 1;
			}
		}
		else if(state instanceof OpenClosedType) {
			if(state == OpenClosedType.CLOSED) {
				value = 0;
			}
			else {
				value = 1;
			}
		}
		else {
//			logger.debug("Unsupported item type in chart: {}", state.getClass().toString());
			value = 0;
		}
//		logger.debug("addData: {}  {}   -----", time, value);

		HistoryDataBean newVal = new HistoryDataBean();
		newVal.time = time;
		newVal.state = state.toString();//Double.toString(value);
		data.add(newVal);
		
		return value;
	}
	
//	@JsonSerialize(using = ItemHistoryBean.JsonHistorySerializer.class)
	
	public static class HistoryDataBean {
//		@XmlAttribute
		public Long time;
		
//		@XmlValue
		public String state;
	}
/*
	public class JsonHistorySerializer extends JsonSerializer<HistoryDataBean>{

		@Override
		public void serialize(HistoryDataBean history, JsonGenerator gen, SerializerProvider provider) throws IOException,
				JsonProcessingException {
			String jsonHistory = new String("["+history.time+","+history.state+"]");			
	        gen.writeString(jsonHistory);
		}
	 
	}*/
}
