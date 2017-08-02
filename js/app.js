 $(function() {
                $('#aboutModal').modal('show');
                
                window.map = L.map('map', {
                    center: [39.952473, -75.164106],
                    zoom: 10
                })
                                
                var ZoomToRegionControl = L.Control.extend({
                    options: { position: 'topleft' },
                    onAdd: function (map) {
                        return $(Mustache.render($('#zoomToRegionTmpl').html(), {}))[0]
                    }
                })
                map.addControl(new ZoomToRegionControl())

        //        var ResultsControl = L.Control.extend({
        //            options: { position: 'topright' },
        //            onAdd: function (map) {
        //                return $('#resultsSection')[0]
        //            }
        //        })
        //        map.addControl(new ResultsControl())

                // Basemap Layers
                var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                    subdomains: 'abcd',
                    maxZoom: 19
                });
                map.addLayer(CartoDB_Positron);

            // Add Circuit
                var circuit = L.geoJson(null, {
                style: function(feature) {
                    switch (feature.properties.CIRCUIT) {
                    case 'Existing': return {color: "#8dc63f", weight: 3, opacity: 1,};
                    case 'Planned':   return {color: "#008192", weight: 3,opacity: 1,};
                    case 'In Progress':   return {color: "#fdae61", weight: 3,opacity: 1,};
                    }
                    },
                    onEachFeature: function(feature, layer) {
                    if (feature.properties.CIRCUIT==='Existing'){ var mycolor = {className:'leaflet-label-TND2'};}
                    else if (feature.properties.CIRCUIT==='Planned'){ var mycolor = {className:'leaflet-label-TND3'};}
                    else { var mycolor = {className:'leaflet-label-TND4'};}

                     layer.bindPopup(feature.properties.NAME,mycolor);
                    },
                });
                $.getJSON("http://dvrpc-dvrpcgis.opendata.arcgis.com/datasets/c830cdb70f654c36bfd88eb7ed4bc424_0.geojson", function(data) {
                    circuit.addData(data);
                });

            // Add County Boundary        
                var DVRPC = L.geoJson(null, {
                    style: {stroke:true,fillColor:'none',color: '#636363',weight: 3,fill: true, clickable: false}
                });
                $.getJSON("data/COUNTY_DVRPC.js", function (data) {
                    DVRPC.addData(data);
                });
                DVRPC.addTo(map);

                var PCIcon = L.icon({
                            iconUrl: 'img/pc_marker.png',
                            iconSize: [20, 33]
                      //    iconAnchor: [15, 15]
                      //    popupAnchor: [0, 15]
                    });

            // Add Perm Counter

                function style(feature) {
                    return {
                        "color": "#d53e4f",
                        "radius": 10,
                        "weight": 0,
                        "opacity": 1,
                        "fillOpacity": 0.8
                    };
                }        
                
                var PC = L.geoJson(null, { 
                    pointToLayer: function(feature, latlng) {
                    return L.marker(latlng, {icon: PCIcon, riseOnHover: true});
                },
                 onEachFeature: function(feature, layer) {
                var link =  (feature.properties.LOCATIONNAME) + "<br><a href='http://www.dvrpc.org/webmaps/PermBikePed/' target='_new'>View Counter Data</a>" ;
                 layer.bindPopup(link, {className:'leaflet-label-TND'});
                    },
                });
                $.getJSON("http://www.dvrpc.org/webmaps/permbikeped/data/data.aspx", function (data) {
                    PC.addData(data);
                });

                // Add Manual Counts
             //   color = feature.properties.TYPE.match(/^Bicycle 2/) ? '#2e5c95' : '#d4007e'

                function style(feature) {
                    return {
                      //  "color": "#d53e4f",
                      "color": feature.properties.TYPE.match(/^Bicycle 2/) ? '#2e5c95' : '#d4007e',
                        "radius": feature.properties.TYPE.match(/^Bicycle 2/) ? '15' : '6',
                        "weight": 0,
                        "opacity": 1,
                        "fillOpacity": feature.properties.TYPE.match(/^Bicycle 2/) ? '1' : '.25',
                    };
                }        
                
                var man = L.geoJson(null, { 
                    pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, style(feature));
                },
                 onEachFeature: function(feature, layer) {
                      layer.on({
                        click: tboro
                        });
                    },
                });
                $.getJSON("data/man.js", function (data) {
                    man.addData(data);
                });
                man.addTo(map).bindTooltip('South St Boardwalk', {direction: 'top'});

                var baseLayers = {
                    "Grayscale": CartoDB_Positron
                };

                var overlays = {
                    "The Circuit": circuit,
                    "Permanent Bike/Ped Counters": PC
                };

                L.control.layers(null,overlays).addTo(map);

                var populationLegend = L.control({position: 'bottomright'});
                var populationChangeLegend = L.control({position: 'bottomright'});

                populationLegend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
             //    color = feature.attributes.TYPE.match(/^Bicycle/) ? '#2e5c95' : '#d4007e'
                    div.innerHTML +='<div style="margin-left: 15px;"><span style="background-color:#2e5c95;margin-right:25px;"></span>Bicycle Count</div><div style="margin-left: 15px;"><span style="background-color:#d4007e;margin-right:25px;"></span>Pedestrian Count</div><div><b>The Circuit</b></div><div><span2 style="background-color:#8dc63f"></span2>Existing</div><div><span2 style="background-color:#fdae61"></span2>In Progress</div><div><span2 style="background-color:#008192"></span2>Planned</div>';
                return div;
                };

                populationChangeLegend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
             //    color = feature.attributes.TYPE.match(/^Bicycle/) ? '#2e5c95' : '#d4007e'
                    div.innerHTML +='<div style="margin-left: 15px;"><span style="background-color:#2e5c95;margin-right:25px;"></span>Bicycle Count</div><div style="margin-left: 15px;"><span style="background-color:#d4007e;margin-right:25px;"></span>Pedestrian Count</div>';
                return div;
                };

                // Add this one (only) for now, as the Population layer is on by default
                 populationChangeLegend.addTo(map);

                map.on('overlayadd', function (eventLayer) {
                    // Switch to the Population legend...
                    if (eventLayer.name === 'The Circuit') {
                        this.removeControl(populationChangeLegend);
                        populationLegend.addTo(this);
                    }
                });
                map.on('overlayremove', function (eventLayer) {
                    // Switch to the Population legend...
                    if (eventLayer.name === 'The Circuit') {
                        this.removeControl(populationLegend);
                        populationChangeLegend.addTo(this);
                    }
                });

                /////FUNCTIONS 
                function tboro(e) {        
                //    $('#results').html('');
                $('#myTab a[href="#Results"]').tab('show');
                    var layer = e.target;
                    var props = layer.feature.properties
                    content = '<div style="text-align:center"><h3>Video Bicycle and Pedestrian 24-Hour Counts </h3>South St Boardwalk <small>From South St to Locust St </small></div>'
                    +'<div><img style="margin:5px 25px 0px 20px;float:left;" src="img/bike_icon.png" alt=""/>'
                    +'</div>'
                    +  '<table class="table table-hover" style="width:90%;margin:0px 0px 0px 15px;">'
                    +    '<thead>'
                    +    '<tr>'
                    +    '<th>Type</th>'
                    +    '<th>Date</th>'
                    +    '<th>DVRPC File #</th>'
                    +    '</tr>'
                    +    '</thead>'
                    +    '<tbody>'
                    +    '<tr>'
                    +    '<td>Bicycle</td>'
                    +    '<td>8/12/2016</td>'
                    +    '<td><a href="http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/129712.pdf" target="_blank" class="btn btn-primary btn-xs" style="margin-left:5px;">129712  <i class="glyphicon glyphicon-new-window"></i></a></td>'
                    +    '</tr>'
                    +    '<tr>'
                    +    '<td>Bicycle</td>'
                    +    '<td>10/21/2014</td>'
                    +    '<td><a href="http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/114831.pdf" target="_blank" class="btn btn-primary btn-xs" style="margin-left:5px;">114831 <i class="glyphicon glyphicon-new-window"></i></a></td>'
                    +    '</tr>'
                    +    '</tbody>'
                    +    '</table>'
                    +    '<div><img style="margin:5px 25px 0px 20px;float:left;" src="img/ped_icon.png" alt=""/>'
                    +    '</div>'
                    +    '<table class="table table-hover" style="width:90%;margin:0px 0px 0px 15px;">'
                    +    '<thead>'
                    +    '<tr>'
                    +    '<th>Type</th>'
                    +    '<th>Date</th>'
                    +    '<th>DVRPC File #</th>'
                    +    '</tr>'
                    +    '</thead>'
                    +    '<tbody>'
                    +    '<tr>'
                    +    '<td>Pedestrian</td>'
                    +    '<td>8/12/2016</td>'
                    +    '<td><a href="http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/122082.pdf" target="_blank" class="btn btn-primary btn-xs" style="margin-left:5px;">122082 <i class="glyphicon glyphicon-new-window"></i></a></td>'
                    +    '</tr>'
                    +    '<tr>'
                    +    '<td>Pedestrian</td>'
                    +    '<td>8/11/2016</td>'
                    +    '<td><a href="http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/129713.pdf" target="_blank" class="btn btn-primary btn-xs" style="margin-left:5px;">129713  <i class="glyphicon glyphicon-new-window"></i></a></td>'
                    +    '</tr>'
                    +    '<tr>'
                    +    '<td>Pedestrian</td>'
                    +    '<td>10/21/2014</td>'
                    +    '<td><a href="http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/114832.pdf" target="_blank" class="btn btn-primary btn-xs" style="margin-left:5px;">114832 <i class="glyphicon glyphicon-new-window"></i></a></td>'
                    +    '</tr>'
                    +    '</tbody>'
                    +    '</table>'
                    ;
                    document.getElementById('infosidebar').innerHTML = content;
                };


                map.data = L.featureGroup().bindTooltip(function (layer) { return layer.feature.properties.ROAD }, {direction: 'top'}).on('click', function (e) {
                    var matches = {},
                        result = [],
                        objectids = []

                    map.data.eachLayer(function (f) {
                        var p1 = e.layerPoint,
                            p2 = map.latLngToLayerPoint(f.getLatLng()),
                            distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
                        if (distance < 20) {
                            matches[f.feature.properties.OBJECTID] = f
                            objectids.push(f.feature.properties.OBJECTID)
                        }
                    })

                    if (objectids.length) {
                        $('#results').empty()
                        $.getJSON('http://www.dvrpc.org/webmaps/pedbikecounts/data.aspx?objectIds=' + objectids.join(',') + '&type=bike', function (d, textStatus) {
                            $.getJSON('http://www.dvrpc.org/webmaps/pedbikecounts/data.aspx?objectIds=' + objectids.join(',') + '&type=ped', function (d2, textStatus) {
                                d.relatedRecordGroups.concat(d2.relatedRecordGroups).forEach(function (r) {
                                    var total = 0,
                                        arr = r.relatedRecords.map(function (day) {
                                            total += parseInt(day.attributes.TOTALVOL)
                                            return parseInt(day.attributes.TOTALVOL)
                                        }),
                                        max = Math.max.apply(null, arr),
                                        color = matches[r.objectId].feature.properties.TYPE.match(/^Bicycle/) ? '#2e5c95' : '#d4007e'
                                    $.each(r.relatedRecords, function(i) {
                                        var dt = new Date(r.relatedRecords[i].attributes.CDATE)
                                        r.relatedRecords[i] = r.relatedRecords[i].attributes
                                        r.relatedRecords[i].PERCENT = parseInt(r.relatedRecords[i].TOTALVOL) / max * 100
                                        r.relatedRecords[i].COLOR = color
                                        r.relatedRecords[i].PADDING = 100 - (parseInt(r.relatedRecords[i].TOTALVOL) / max * 100) > 50 ? 55 : 100 - (parseInt(r.relatedRecords[i].TOTALVOL) / max * 100)
                                                               //     feature.attributes.AADB > 151 ? 9 : feature.attributes.AADB > 47 ? 7 : feature.attributes.AADB > -5 ? 5 : 3) :
                                        r.relatedRecords[i].VOLUMESTR = formatNumber(parseInt(r.relatedRecords[i].TOTALVOL))
                                        r.relatedRecords[i].DAY = ['SUN','MON','TUE','WED','THU','FRI','SAT'][dt.getDay()]
                                        r.relatedRecords[i].DATE = [dt.getMonth() + 1, dt.getDate(), dt.getYear() + 1900].join('/')
                                        r.relatedRecords[i].DATERANGE = [dt.getMonth()+ 1,dt.getYear()+ 1900].join('/')
                                    })
                                    matches[r.objectId].feature.properties.DETAILS = r.relatedRecords
                                    matches[r.objectId].feature.properties.TOTALCOUNT = formatNumber(total)
                                })
                        
                            $.each(matches, function () {
                                var d = (parseInt(this.feature.properties.SETDATE.split('/')[0]));
                                var months = ['','January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
                                var monthString = months[d];
                            //    var sd = new daterange(this.feature.properties.TYPE)
                           //     this.feature.properties.TYPE = this.feature.properties.TYPE.split(' ')[0]
                                this.feature.properties.ROAD = toTitleCase(this.feature.properties.ROAD)
                                this.feature.properties.FROMLMT = toTitleCase(this.feature.properties.FROMLMT)
                                this.feature.properties.TOLMT = toTitleCase(this.feature.properties.TOLMT)
                                this.feature.properties.SETMONTH = this.feature.properties.SETDATE.split('/')[0]
                                this.feature.properties.SETYEAR = this.feature.properties.SETDATE.split('/')[2]
                             //    this.feature.properties.REPORT = 'http://www.dvrpc.org/asp/' + (this.feature.properties.TYPE.match(/^Bicycle/) ? 'bike' : 'pedestrian') + 'count/default.aspx?RECNUM=' + this.feature.properties.RECORDNUM
                                this.feature.properties.REPORT = this.feature.properties.TYPE.match(/^Bicycle 6/) ? 'http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/'+ this.feature.properties.RECORDNUM+'.pdf' : this.feature.properties.TYPE.match(/^Pedestrian 2/) ? 'http://www.dvrpc.org/asp/TrafficCountPDF/BikePed/'+ this.feature.properties.RECORDNUM+'.pdf': 'http://www.dvrpc.org/asp/' + (this.feature.properties.TYPE.match(/^Bicycle/) ? 'bike' : 'pedestrian') + 'count/default.aspx?RECNUM=' + this.feature.properties.RECORDNUM
                                this.feature.properties.DIR = this.feature.properties.CNTDIR || this.feature.properties.SIDEWALK || ""
                                this.feature.properties.TYPE2 = (this.feature.properties.TYPE.match(/^Bicycle 6/) ? 'Bicycle': this.feature.properties.TYPE.match(/^Pedestrian 2/) ? 'Pedestrian' : this.feature.properties.TYPE.match(/^Bicycle/) ? 'Bicycle':'Pedestrian')
                            //    this.feature.properties.TYPE2 = (this.feature.properties.TYPE.match(/^Bicycle 6/) ? 'B': this.feature.properties.TYPE.match(/^Pedestrian 2/) ? 'P' : this.feature.properties.TYPE.match(/^Bicycle/) ? 'B':'P')
                                this.feature.properties.ICON = (this.feature.properties.TYPE.match(/^Bicycle/) ? 'img/bike_icon.png': 'img/ped_icon.png')
                                this.feature.properties.HEADING = this.feature.properties.DIR.match(/^n/) ? 0 : this.feature.properties.DIR.match(/^e/) ? 90 : this.feature.properties.DIR.match(/^s/) ? 180 : 270
                                this.feature.properties.TEXTCOLOR =  this.feature.properties.TYPE.match(/^Bicycle/) ? '#2e5c95' : '#d4007e'
                                this.feature.properties.MONTH = monthString
                                this.feature.properties.ICONSTYLE = (this.feature.properties.TYPE.match(/^Bicycle/) ? '0px': '10px')
                                result.push(this.feature.properties)
                            })
                            var sorted = result.sort(function (a,b) { return new Date(b.SETDATE).getTime() - new Date(a.SETDATE).getTime() }),
                                count = 0

                            $.each(sorted, function () {
                                this.index = ++count
                                this.firstChild = function() { return this.index === 1 ? 'active' : ''}
                            })
                            showResults({result: sorted})
                          //  console.log(sorted[0].DETAILS)
                        })})
                    }
                }).addTo(map)

               var peddata = $.getJSON('http://www.dvrpc.org/webmaps/pedbikecounts/data.aspx?type=bike', parseData)
               var bikedata = $.getJSON('http://www.dvrpc.org/webmaps/pedbikecounts/data.aspx?type=ped', parseData)

                $(document).on('click', '#zoomToRegion', function (e) {
                    map.fitBounds(map.data.getBounds())
                    e.preventDefault()
                }).on('submit', '#searchForm', function (e) {
                    e.preventDefault()
                    $.getJSON('http://open.mapquestapi.com/geocoding/v1/address?key=Fmjtd%7Cluu82q0rnu%2C22%3Do5-94yx5f&maxResults=1&location=' + $('#searchBox').val() + '&boundingBox=' + [map.data.getBounds().getNorthWest().lat, map.data.getBounds().getNorthWest().lng, map.data.getBounds().getSouthEast().lat, map.data.getBounds().getSouthEast().lng].join(',') + '&callback=?', function (d) {
                     //   console.log(d.results[0].locations[0].latLng)
                        map.setView(d.results[0].locations[0].latLng, 13)
                    })
                }).on('click', '#streetViewBtn', function(e) {
                    e.preventDefault()
                    window.open('http://maps.google.com/maps?layer=c&cbll=' + $(this).data('location') + '&cbp=12,' + $(this).data('heading') + ',0,0,5')
                }).on('click', '#zoomToBtn', function(e) {
                    e.preventDefault()
                    map.setView($(this).data('location').split(','), 18)
                })/*.on('click', 'a[data-record]', function() {
                    map.data.revertStyle()
                    map.data.overrideStyle(map.data.getLayer($(this).data('record')), {icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 9,
                        fillColor: '#f00',
                        fillOpacity: 1,
                        strokeWeight: 0
                    }})
                })*/
            })
            
            function symbolize(feature) {
                var scale = feature.attributes.TYPE.match(/^Bicycle/) ?
                        (feature.attributes.AADB > 151 ? 9 : feature.attributes.AADB > 47 ? 7 : feature.attributes.AADB > -5 ? 5 : 3) :
                        (feature.attributes.AADP > 1828 ? 9 : feature.attributes.AADP > 718 ? 7 : feature.attributes.AADP > 271 ? 5 : 3),
            //crp        color = feature.attributes.TYPE.match(/^Bicycle/) ? '#FF8800' : '#C500FF'
                    color = feature.attributes.TYPE.match(/^Bicycle/) ? '#2e5c95' : '#d4007e'
                return {
                    stroke: false,
                    fillColor: color,
               //     radius: scale + 2,
                    radius: 6,
                    fillOpacity: 0.8
                }
            }
            
            function formatNumber(val) {
                return parseFloat(val).toFixed(0).replace(new RegExp('\\d(?=(\\d{3})+$)', 'g'), '$&,')
            }
            
            function toTitleCase(str) {
                return str.replace(/\w\S*/g, function (txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
            }
            
            function parseData(d) {
                d.features.forEach(function (feature) {
                    feature.attributes.AADX = formatNumber(parseInt(feature.attributes.AADB) || parseInt(feature.attributes.AADP))
                    var m = L.circleMarker([feature.geometry.y, feature.geometry.x], symbolize(feature))
                    m.feature = {properties: feature.attributes}
                    if (!isNaN(parseInt(feature.attributes.AADB) || parseInt(feature.attributes.AADP))) {
                     //   map.data.addLayer(m).bindPopup(feature.attributes.ROAD)
                        map.data.addLayer(m)
                    }
                // crp    if (!feature.attributes.AADX.length || isNaN(parseInt(feature.attributes.AADX))) console.log(feature.attributes)   
                     })
           //     map.fitBounds(map.data.getBounds())
            }
            
            function showResults(obj) {
            //    console.log(obj.result.length)
            //    $('#results').show();
                $('#myTab a[href="#layers"]').tab('show');     
                var html = Mustache.render($('#resultsTmpl').html(), obj),
                res_counts = obj.result.length;
            //  console.log(res_counts)
               
                $('#results').append(html);
                //bootstrap pagination
                var pager_options = {
                    currentPage: 1,
                    totalPages: res_counts,
                    bootstrapMajorVersion: 3,
                    
                    pageUrl: function(type, page, current){
                    return "#rec-"+page;
                    },
                    onPageChanged: function(e,oldPage,newPage){
                        $('.pagination li a').attr('data-toggle', 'tab');
                        $('.pagination').tab();
                    }
                }
                $('#tab-navigation').bootstrapPaginator(pager_options);
                $('.pagination li a').attr('data-toggle', 'tab');
                $('.pagination').tab();

                 document.getElementById('total').innerHTML = 'Total results returned: ' + res_counts.toString();
            }