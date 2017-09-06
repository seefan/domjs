/**
 * 高德地图相关应用
 * @class app.map
 */
(function (service, undefined) {
    service.map = undefined;
    /**
     * 初始化地图
     * @method init
     * @param id {string} 容器id
     * @param callback {function}
     */
    service.init = function (id, callback) {
        //初始化地图对象
        if (!window.AMap) {
            return;
        }
        service.cityname = '北京';
        if (typeof id == 'function') {
            callback = id;
            id = undefined;
        }
        if (!id) {
            id = 'container';
        }
        //初始化地图对象，加载地图
        //初始化加载地图时，若center及level属性缺省，地图默认显示用户当前城市范围
        var map = new AMap.Map(id, {
            resizeEnable: true
        });
        service.map = map;

        service.map.getCity(function (data) {
            if (data['province'] && typeof data['province'] === 'string') {
                service.cityname = (data['city'] || data['province']);
                service.province = data['province'];
                service.city = data['city'];
            }
        });
        AMap.event.addListener(service.map, 'dragend', function (e) {
            if (service.draged_callback) {
                service.draged_callback(service.map.getCenter());
            }
        });
        service.Autocomplete = false;
        service.toolbar = false;
        service.MGeocoder = false;
        service.MSearch = false;
        if (callback) {
            callback(service.map);
        }
    };
    /**
     * 设置缩放中心点
     * @method setZoomCenter
     * @param zoom {number} 缩放级别，参考高德API
     * @param longi {number} 经度
     * @param lati {number} 纬度
     */
    service.setZoomCenter = function (zoom, longi, lati) {
        if (service.map && longi && lati) {
            service.map.setZoomAndCenter(zoom, new AMap.LngLat(longi, lati));
        }
    };
    /**
     * 自动完成关键字
     * @method autoKeywords
     * @param keywords {string} 关键字
     * @param callback {function} 回调函数
     */
    service.autoKeywords = function (keywords, callback) {
        if (service.Autocomplete) {
            if (keywords) {
                service.Autocomplete.search(keywords);
            }
        } else {
            service.map.plugin(["AMap.Autocomplete"], function () {
                var _city = service.cityname;
                var autoOptions = {
                    city: _city //城市，默认全国
                };
                service.Autocomplete = new AMap.Autocomplete(autoOptions);
                AMap.event.addListener(service.Autocomplete, "complete", callback);
                if (keywords) {
                    service.Autocomplete.search(keywords);
                }
            });
        }
    };

    /**
     * 定位
     * @method location
     * @param callback {function} 回调函数，返回当前位置
     * @param enLoc {boolean} 是否启用自动定位
     */
    service.location = function (callback, enLoc) {
        if (service.toolbar) {
            if (enLoc) {
                service.toolbar.doLocation();
            }
        } else {
            //地图中添加地图操作ToolBar插件
            service.map.plugin(['AMap.ToolBar'], function () {
                //设置地位标记为自定义标记
                service.toolbar = new AMap.ToolBar();
                service.map.addControl(service.toolbar);
                AMap.event.addListener(service.toolbar, 'location', function (e) {
                    if (callback) {
                        callback(e.lnglat);
                    }
                });
                if (enLoc) {
                    service.toolbar.doLocation();
                }
            });

        }
    };
    /**
     * 设置移动位置回调
     * @method setDragend
     * @param callback {function} 回调函数
     */
    service.setDragend = function (callback) {
        service.draged_callback = callback;
    };
    /**
     * 根据地点位置，查询合适的地址
     * @method geocoder
     * @param point 经纬度点
     * @param callback {function} 回调函数
     */
    service.geocoder = function (point, callback) {
        var MGeocoder = service.MGeocoder;
        if (MGeocoder) {
            //逆地理编码
            MGeocoder.getAddress(point, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    if (result.regeocode.pois.length > 0) {
                        if (callback) {
                            callback(result.regeocode);
                        }
                    }
                }
            });
        } else {
            //加载地理编码插件
            AMap.service(["AMap.Geocoder"], function () {
                MGeocoder = new AMap.Geocoder({
                    radius: 200,
                    extensions: "all"
                });
                service.MGeocoder = MGeocoder;
                //逆地理编码
                MGeocoder.getAddress(point, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        if (result.regeocode.pois.length > 0) {
                            if (callback) {
                                callback(result.regeocode);
                            }
                        }
                    }
                });
            });
        }
    };
    /**
     * 根据给出的地址进行定位
     * @method locationAddress
     * @param address {string} 地址
     * @param level {number} 绽放级别，默认为10
     */
    service.locationAddress = function (address, level) {
        if (typeof level == 'undefined') {
            level = 10;
        }
        var MGeocoder = service.MGeocoder;
        if (MGeocoder) {
            //地理编码,返回地理编码结果
            MGeocoder.getLocation(address, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    if (result.geocodes.length > 0) {
                        service.setZoomCenter(level, result.geocodes[0].location.getLng(), result.geocodes[0].location.getLat())
                    }
                }
            });
        } else {
            //加载地理编码插件
            AMap.service(["AMap.Geocoder"], function () {
                MGeocoder = new AMap.Geocoder({
                    radius: 200,
                    extensions: "all"
                });
                service.MGeocoder = MGeocoder;
                MGeocoder.getLocation(address, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        if (result.geocodes.length > 0) {
                            service.setZoomCenter(level, result.geocodes[0].location.getLng(), result.geocodes[0].location.getLat())
                        }
                    }
                });
            });
        }
    };
    /**
     * 根据id进行地点查询
     * @method placeSearch
     * @param id {string} 位置id
     * @param callback {function} 回调函数
     */
    service.placeSearch = function (id, callback) {
        var MSearch = service.MSearch;
        if (MSearch) {
            //详情查询
            MSearch.getDetails(id, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    if (callback) {
                        callback(result);
                    }
                }
            });
        } else {
            AMap.service(["AMap.PlaceSearch"], function () {
                MSearch = new AMap.PlaceSearch(); //构造地点查询类
                service.MSearch = MSearch;
                MSearch.getDetails(id, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        if (callback) {
                            callback(result);
                        }
                    }
                });
            });
        }
    };
})(window.app.map = {});