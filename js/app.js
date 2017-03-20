 $(function() {
                $('#aboutModal').modal('show');
                
                window.map = L.map('map', {
                    center: [39.952473, -75.164106],
                    zoom: 10
                }).on('click', function (e) {
                    e.originalEvent.target.nodeName === 'svg' && $('#results').html('<p>Click on markers on the map to view details for that location. Results will appear here.</p><p>Enter an address in the search bar above to zoom to that location.</p><p></p>')
                })
                                
                var ZoomToRegionControl = L.Control.extend({
                    options: { position: 'topleft' },
                    onAdd: function (map) {
                        return $(ich.zoomToRegionTmpl({}))[0]
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
                var Mapbox_dark = L.tileLayer.provider('MapBox.crvanpollard.hghkafl4')

                var Stamen_Terrain = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: 'abcd',
                minZoom: 0,
                maxZoom: 18,
                ext: 'png'
                });

                var Mapbox_Imagery = L.tileLayer(
                    'https://api.mapbox.com/styles/v1/crvanpollard/cimpi6q3l00geahm71yhzxjek/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6Ii00ZklVS28ifQ.Ht4KwAM3ZUjo1dT2Erskgg', {
                        tileSize: 512,
                        zoomOffset: -1,
                        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    });

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
         //            var mycolor = feature.properties.CIRCUIT; 
         //       if (mycolor==='Existing'){
         //           return  {className:'leaflet-label-TND'};
         //        }else if(mycolor==='In Progress'){
         //           return  {className:'leaflet-label-TND2'};
         //       }

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

                var TNDIcon = L.icon({
                            iconUrl: 'img/pc_marker.png',
                            iconSize: [20, 33]
                      //      iconAnchor: [15, 15]
                          //  popupAnchor: [0, 15]
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
                    return L.marker(latlng, {icon: TNDIcon, riseOnHover: true});
                },
                 onEachFeature: function(feature, layer) {
                var link =  (feature.properties.LOCATIONNAME) + "<br><a href='http://www.dvrpc.org/webmaps/PermBikePed/' target='_new'>View Counter Data</a>" ;
                 layer.bindPopup(link, {className:'leaflet-label-TND'});
                    },
                });
                $.getJSON("http://www.dvrpc.org/webmaps/permbikeped/data/data.aspx", function (data) {
                    PC.addData(data);
                });

                var baseLayers = {
                    "Grayscale": CartoDB_Positron,
                    "Terrian": Stamen_Terrain
                };

                var overlays = {
                    "The Circuit": circuit,
                    "Permanent Bike/Ped Counters": PC
                };

                L.control.layers(null,overlays).addTo(map);

                var populationLegend = L.control({position: 'bottomright'});
                var populationChangeLegend = L.control({position: 'bottomright'});

                populationLegend.onAdd = function (map) {
                var legendDiv = L.DomUtil.create('div', 'map-legend legend-control leaflet-bar');

              //  legendDiv.innerHTML += '<div id="legend-icon" title="Toggle Legend"><i class="glyphicon glyphicon-minus"></i><span class="legend-label" style="display:none;">&nbsp;&nbsp;Legend</span></div>';

               // var legend_top = L.DomUtil.create('div', 'map-legend-items legend-top', legendDiv),
                var legend_body = L.DomUtil.create('div', 'map-legend-items legend-body', legendDiv);
               // legend_bottom = L.DomUtil.create('div', 'map-legend-items legend-bottom', legendDiv);

                legend_body.innerHTML += '<div id="legend-content" class="row"><p>&nbsp;&nbsp;<b>The Circuit Trails</b><br><div class="col-xs-4"><i class="glyphicon glyphicon-minus ct-existing"></i>&nbsp;&nbsp;Existing</div><div class="col-xs-4"><i class="glyphicon glyphicon-minus ct-inprogress"></i>&nbsp;&nbsp;In Progress</div><div class="col-xs-4"><i class="glyphicon glyphicon-minus ct-planned"></i><span>&nbsp;&nbsp;Planned</span></div></div>';

               // legend_top.innerHTML += '<p><b>The Circuit Trails</b>'

              //  legendDiv.setAttribute('data-status', 'open');

                return legendDiv;


          //      var div = L.DomUtil.create('div', 'info legend');
          //          div.innerHTML +=
          //          '<img src="img/circuit.png" alt="legend" width="300" height="60">';
          //      return div;
                };

                populationChangeLegend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                    div.innerHTML +=
                    '<img src="img/legend.png" alt="legend" width="0" height="0">';
                return div;
                };

                // Add this one (only) for now, as the Population layer is on by default
                // populationLegend.addTo(map);

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
                       // populationLegend.addTo(this);
                    }
                });

                /////FUNCTIONS      
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
                                        r.relatedRecords[i].PADDING = 100 - (parseInt(r.relatedRecords[i].TOTALVOL) / max * 100)
                                        r.relatedRecords[i].VOLUMESTR = formatNumber(parseInt(r.relatedRecords[i].TOTALVOL))
                                        r.relatedRecords[i].DAY = ['SUN','MON','TUE','WED','THU','FRI','SAT'][dt.getDay()]
                                        r.relatedRecords[i].DATE = [dt.getMonth() + 1, dt.getDate(), dt.getYear() + 1900].join('/')
                                        r.relatedRecords[i].DATERANGE = [dt.getMonth()+ 1,dt.getYear()+ 1900].join('/')
                                    })
                                    matches[r.objectId].feature.properties.DETAILS = r.relatedRecords
                                    matches[r.objectId].feature.properties.TOTALCOUNT = formatNumber(total)
                                })
                        
                            $.each(matches, function () {

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
                                this.feature.properties.HEADING = this.feature.properties.DIR.match(/^n/) ? 0 : this.feature.properties.DIR.match(/^e/) ? 90 : this.feature.properties.DIR.match(/^s/) ? 180 : 270
                                this.feature.properties.index = result.length + 1
                                this.feature.properties.firstChild = function() { return this.index === 1 ? 'active' : ''}
                                result.push(this.feature.properties)
                            })
                            showResults({result: result})
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
                        (feature.attributes.AADB > 151 ? 9 : feature.attributes.AADB > 47 ? 7 : feature.attributes.AADB > 12 ? 5 : 3) :
                        (feature.attributes.AADP > 1828 ? 9 : feature.attributes.AADP > 718 ? 7 : feature.attributes.AADP > 271 ? 5 : 3),
            //crp        color = feature.attributes.TYPE.match(/^Bicycle/) ? '#FF8800' : '#C500FF'
                    color = feature.attributes.TYPE.match(/^Bicycle/) ? '#2e5c95' : '#d4007e'
                return {
                    stroke: false,
                    fillColor: color,
               //     radius: scale + 2,
                    radius: 6,
                    fillOpacity: 0.35
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
                var html = ich.resultsTmpl(obj),
                    res_counts = obj.result.length;
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
            }