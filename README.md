HABmin2
=======

HABmin version2 - ultimately targeted toward openHAB2

To test, you need to grab the habmin JAR from the HABmin repository (https://github.com/cdjackson/HABmin/blob/master/addons/org.openhab.io.habmin-1.6.0-SNAPSHOT.jar) and add it to your addons folder.

Then grab the test ZIP file (https://github.com/cdjackson/HABmin2/releases/download/0.0.2/habmin2.zip) and unzip it into a folder webapps/habmin2 in your openhab installation.

Then open the browser at http://openhab server/habmin2.

Screenshots
===========


![charting](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/charting-saved.png)
![charting-editor](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/charting-edit.png)
![rules-block](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/rules-blocks.png)
![rules-source](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/rules-source.png)
![zwave-config](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/zwave-config.png)
![zwave-network](https://raw.github.com/wiki/cdjackson/HABmin2/screenshots/zwave-network.png)




Contributing
============
Clone the repository to your computer.
install ```npm``` (node package manager) and run ```npm update``` to install all the development dependancies.

To compile for debug, run ```grunt build```
To compile for release, run ```grunt compile```
To compile embedded versions, run ```grunt phones```
