function find_depot(){}
find_depot.NAME         = "find_depot";
find_depot.VERSION      = "1.2";
find_depot.DESCRIPTION  = "Class find_depot";

find_depot.prototype.constructor = find_depot;
find_depot.prototype = {
    init:function(){
        $('#order_form').on('click','.check-rate',function(){
            var $me = $(this)
            if($(this).is(":checked")){
                var container_type_id = $me.closest('tr').find('.container_type_id').val()
                var container_feet_type = $me.closest('tr').find('.container_feet_type').val()
                var address = $('#order_form #bill_to_ID option:selected').attr('address')

                if(container_type_id !=undefined && container_type_id !='' &&
                    address !=undefined && address !=''){
                    find_depot.prototype.find_nearest_depots(container_type_id,container_feet_type,address,$me,'','');
                }else{
                    $('#modal-error #err-message').text("Item isn't not container or to Bill to address is null")
                    $('#modal-error').modal("show")
                    $(this).prop("checked",false)
                    setTimeout(function(){
                        $('#modal-error').modal("hide")
                    },3000)
                }
            }
        });

    },
    /***********************************/
    find_nearest_depots:function(container_type_id,container_feet_type,zipcode,$me,find_depot,el1){
        // console.log("des ="+bill_to_address)
        var _link =link._depots_nearest;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:{token:_token,
                container_type_id:container_type_id,
                container_feet_type:container_feet_type,
                find_depot:find_depot},
            error : function (status,xhr,error) {
            },
            success: function (data){
                //console.log(data.depots.length);
                if(data.depots.length >0){
                    var origin = [];
                    data.depots.forEach(function(item){
                        origin.push(item["depot_address"])
                    })
                    var latitude ='';
                    var longitude='';
                    var geocoder = new google.maps.Geocoder();
                    var address = zipcode;
                    geocoder.geocode({ 'address': 'zipcode '+address }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            latitude = results[0].geometry.location.lat();
                            longitude = results[0].geometry.location.lng();
                            //console.log("Latitude: " + latitude + "\nLongitude: " + longitude);
                            //
                            const bounds = new google.maps.LatLngBounds();
                            const markersArray = [];

                            var service = new google.maps.DistanceMatrixService()

                            const destination = { lat: latitude, lng: longitude };

                            service.getDistanceMatrix({
                                origins: origin,
                                destinations: [destination],
                                travelMode: google.maps.TravelMode.DRIVING ,
                                unitSystem: google.maps.UnitSystem.IMPERIAL,
                                avoidHighways: false,
                                avoidTolls: false
                            }, function(response, status) {
                                // console.log("or ="+origin)
                                if (status == google.maps.DistanceMatrixStatus.OK) {
                                    var nearest_distance =[];
                                    var smallest =0;
                                    var smaller =0;
                                    var i=0;
                                    // console.log(response.rows)
                                    response.rows.forEach(function(item1){
                                        var item = item1.elements[0]
                                        if(item.status =="OK"){
                                            //console.log(item.distance.text.split(" ")[0])
                                            if(nearest_distance.length <1){
                                                smallest =item.distance.text.split(" ")[0];
                                                smallest = smallest.replace( /,/g, "" );
                                                var add_el = {address : origin[i],distance:smallest}
                                                if(parseFloat(smallest) < less_than_300ml){
                                                    //console.log(add_el)
                                                    nearest_distance.push(add_el);
                                                }

                                            }else if(nearest_distance.length >0 && nearest_distance.length <4 ){
                                                var lgth= nearest_distance.length;
                                                var b = item.distance.text.split(" ")[0];
                                                b = b.replace( /,/g, "" );
                                                b = parseFloat(b)
                                                var add_el = {address : origin[i],distance:b}
                                                if(b < less_than_300ml){
                                                    var is_insert = true;
                                                    for(var j=0;j<lgth;j++){
                                                        var a = parseFloat(nearest_distance[j].distance);
                                                        if(a >=b){
                                                            //nearest_distance.unshift(add_el);
                                                            nearest_distance.splice(j,0,add_el)
                                                            is_insert = true;
                                                            if(nearest_distance.length>3){
                                                                nearest_distance.pop();
                                                                break;
                                                            }
                                                        }else{
                                                            if(nearest_distance.length>3){
                                                                break;
                                                            }else{
                                                                var jj = j+1
                                                                if(jj == lgth){
                                                                    nearest_distance.splice(jj,0,add_el)
                                                                }
                                                            }
                                                        }
                                                    }//end for
                                                }
                                            }//
                                        }

                                        i++;
                                    });
                                    //console.log(nearest_distance)
                                    var depots_temp =[]; var depots_temp_qty =[]
                                    var tr='';
                                    nearest_distance.forEach(function(item1){
                                        data.depots_short.forEach(function(item2){
                                            // if(item1.address.localeCompare(item2.depot_address) ==0){
                                            if(item1.address == item2.depot_address){
                                                var temp = {
                                                    distance: item1.distance,
                                                    depot_id:item2.depot_id,
                                                    depot_name:item2.depot_name,
                                                    depot_address:item2.depot_address,
                                                    vendor_id:item2.vendor_id,
                                                    rate_mile:item2.rate_mile,
                                                    container_type_id:item2.container_type_id,
                                                    container_feet_type:item2.container_feet_type,
                                                    container_type_name:item2.container_type_name,
                                                    container_rate:item2.container_rate,
                                                    prod_SKU:item2.prod_SKU,
                                                    prod_id:item2.prod_id,
                                                    prod_name:item2.prod_name,
                                                    product_qty:item2.product_qty
                                                }
                                                depots_temp.push(temp);
                                                if(item2.product_qty > 0){
                                                    var temp2 =temp
                                                    temp2.quantity = 1
                                                    temp2.discount = 0
                                                    temp2.prod_price = parseFloat(item2.container_rate) + parseFloat(item1.distance) * parseFloat(item2.rate_mile) + parseFloat(container_plus_500)
                                                    temp2.SKU =item2.prod_SKU
                                                    temp2.name =item2.prod_name
                                                    temp2.prod_photo =item2.prod_photo
                                                    temp2.prod_class =item2.prod_class
                                                    depots_temp_qty.push(temp2)
                                                }
                                            }
                                        })
                                    });
                                    //show diaglog
                                    //console.log(depots_temp)
                                    if(find_depot=="find_depot"){
                                        console.log(depots_temp)
                                        OrderProducts.prototype.init_order_product(depots_temp_qty)
                                        f_d.depot_available_show(depots_temp,el1,'')
                                    }else{
                                        f_d.process_before_show(depots_temp,'#add-container-modal #container-content',$me);
                                    }
                                    ////////////////
                                }
                            });//end getDistanceMatrix
                        }
                    });

                    ////////////////
                }
            }//end success
        });//end ajax
    },

    /***********************************/
    find_nearest_depots_bk:function(container_type_id,container_feet_type,bill_to_address,$me,find_depot,el1){
       // console.log("des ="+bill_to_address)
        var _link =link._depots_nearest;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:{token:_token,
                container_type_id:container_type_id,
                container_feet_type:container_feet_type,
                find_depot:find_depot},
            error : function (status,xhr,error) {
            },
            success: function (data){
                //console.log(data.depots.length);
                if(data.depots.length >0){
                    var origin = [];
                    data.depots.forEach(function(item){
                        origin.push(item["depot_address"])
                    })

                    var service = new google.maps.DistanceMatrixService()

                    service.getDistanceMatrix({
                        origins: origin,
                        destinations: [bill_to_address],
                        travelMode: google.maps.TravelMode.DRIVING ,
                        unitSystem: google.maps.UnitSystem.IMPERIAL,
                        avoidHighways: false,
                        avoidTolls: false
                    }, function(response, status) {
                       // console.log("or ="+origin)
                        find_depot.prototype.deleteMarkers(markersArray);
                        if (status == google.maps.DistanceMatrixStatus.OK) {
                            var nearest_distance =[];
                            var smallest =0;
                            var smaller =0;
                            var i=0;
                           // console.log(response.rows)
                            response.rows.forEach(function(item1){
                                var item = item1.elements[0]
                                if(item.status =="OK"){
                                    //console.log(item.distance.text.split(" ")[0])
                                    if(nearest_distance.length <1){
                                        smallest =item.distance.text.split(" ")[0];
                                        smallest = smallest.replace( /,/g, "" );
                                        var add_el = {address : origin[i],distance:smallest}
                                        if(parseFloat(smallest) < less_than_300ml){
                                            //console.log(add_el)
                                            nearest_distance.push(add_el);
                                        }

                                    }else if(nearest_distance.length >0 && nearest_distance.length <4 ){
                                        var lgth= nearest_distance.length;
                                        var b = item.distance.text.split(" ")[0];
                                        b = b.replace( /,/g, "" );
                                        b = parseFloat(b)
                                        var add_el = {address : origin[i],distance:b}
                                        if(b < less_than_300ml){
                                            var is_insert = true;
                                            for(var j=0;j<lgth;j++){
                                                var a = parseFloat(nearest_distance[j].distance);
                                                if(a >=b){
                                                    //nearest_distance.unshift(add_el);
                                                    nearest_distance.splice(j,0,add_el)
                                                    is_insert = true;
                                                    if(nearest_distance.length>3){
                                                        nearest_distance.pop();
                                                        break;
                                                    }
                                                }else{
                                                    if(nearest_distance.length>3){
                                                        break;
                                                    }else{
                                                       var jj = j+1
                                                        if(jj == lgth){
                                                            nearest_distance.splice(jj,0,add_el)
                                                        }
                                                    }
                                                }
                                            }//end for
                                        }
                                    }//
                                }

                                i++;
                            });
                            //console.log(nearest_distance)
                            var depots_temp =[]; var depots_temp_qty =[]
                            var tr='';
                            nearest_distance.forEach(function(item1){
                                data.depots_short.forEach(function(item2){
                                    // if(item1.address.localeCompare(item2.depot_address) ==0){
                                    if(item1.address == item2.depot_address){
                                        var temp = {
                                            distance: item1.distance,
                                            depot_id:item2.depot_id,
                                            depot_name:item2.depot_name,
                                            depot_address:item2.depot_address,
                                            vendor_id:item2.vendor_id,
                                            rate_mile:item2.rate_mile,
                                            container_type_id:item2.container_type_id,
                                            container_feet_type:item2.container_feet_type,
                                            container_type_name:item2.container_type_name,
                                            container_rate:item2.container_rate,
                                            prod_SKU:item2.prod_SKU,
                                            prod_id:item2.prod_id,
                                            prod_name:item2.prod_name,
                                            product_qty:item2.product_qty
                                        }
                                        depots_temp.push(temp);
                                        if(item2.product_qty > 0){
                                            var temp2 =temp
                                            temp2.quantity = 1
                                            temp2.discount = 0
                                            temp2.prod_price = parseFloat(item2.container_rate) + parseFloat(item1.distance) * parseFloat(item2.rate_mile) + parseFloat(container_plus_500)
                                            temp2.SKU =item2.prod_SKU
                                            temp2.name =item2.prod_name
                                            temp2.prod_photo =item2.prod_photo
                                            temp2.prod_class =item2.prod_class
                                            depots_temp_qty.push(temp2)
                                        }
                                    }
                                })
                            });
                            //show diaglog
                            //console.log(depots_temp)
                            if(find_depot=="find_depot"){
                                //console.log(depots_temp)
                                OrderProducts.prototype.init_order_product(depots_temp_qty)
                                f_d.depot_available_show(depots_temp_qty,el1,'')
                            }else{
                                f_d.process_before_show(depots_temp,'#add-container-modal #container-content',$me);
                            }
                            ////////////////
                        }
                    });//end getDistanceMatrix
                    ////////////////
                }
            }//end success
        });//end ajax
    },
    /***************************************/
    deleteMarkers: function(markersArray) {
        for (var i = 0; i < markersArray.length; i++) {
            markersArray[i].setMap(null);
        }

        markersArray = [];
    },
    /***************************************/
    process_before_show:function(quotes,el,$me){
        var tr= '';
        var total = 0;
        quotes.forEach(function(item){
            tr += find_depot.prototype.show_container(item);
        });

        $(el).html(tr);
        $('#add-container-modal').modal("show")
        $(el + " .container-select").unbind('click').bind('click',function(){
            //var sku_line = $me.closest('tr').find('.SKU_search').val()
            $me.closest('tr').find('.quantity ').val(1)
            var sku_selected = $(this).closest('.container-info').find('.prod_SKU').val()
            $me.closest('tr').find('.SKU_search').val(sku_selected).trigger('change')
            var price = $(this).closest('.container-info').find('.best_price').val()
            price = numeral(price).format('$ 0,0.00')
            $me.closest('tr').find('.price').val(price).trigger('change')
            $('#add-container-modal').modal("hide")
            find_depot.prototype.set_hidden_field($(this),$me)
        });

        $('#add-container-modal .btn-close-add-container').unbind('click').bind('click',function(){
            $('#add-container-modal').modal("hide")
            $me.prop("checked",false)
        });
        //
    },
   /***************************************/
   show_container:function(depot_item){
       var best_price = (parseFloat(depot_item.distance) * parseFloat(depot_item.rate_mile)) + parseFloat(depot_item.container_rate) +parseFloat(container_plus_500)
        var  tr ='<div class="row container-info">' +
            '<div class="depot_item col col-10">' +
                '<input type="hidden" class="depot_id" value="'+depot_item.depot_id+'">' +
                '<input type="hidden" class="depot_name" value="'+depot_item.depot_name+'">' +
                '<input type="hidden" class="best_price" value="'+best_price+'">' +
                '<input type="hidden" class="container_type_id" value="'+depot_item.container_type_id+'">' +
                '<input type="hidden" class="container_feet_type" value="'+depot_item.container_feet_type+'">' +
                '<input type="hidden" class="container_rate" value="'+depot_item.container_rate+'">' +
                '<input type="hidden" class="container_type_name" value="'+depot_item.container_type_name+'">' +
                '<input type="hidden" class="depot_address" value="'+depot_item.depot_address+'">' +
                '<input type="hidden" class="rate_mile" value="'+depot_item.rate_mile+'">' +
                '<input type="hidden" class="vendor_id" value="'+depot_item.vendor_id+'">' +
                '<input type="hidden" class="prod_name" value="'+depot_item.prod_name+'">' +
                '<input type="hidden" class="prod_SKU" value="'+depot_item.prod_SKU+'">' +
                '<input type="hidden" class="prod_id" value="'+depot_item.prod_id+'">' +
                '<input type="hidden" class="distance" value="'+depot_item.distance+'">' +
                '<input type="hidden" class="product_qty" value="'+depot_item.product_qty+'">' +
                '<div>'+depot_item.depot_name+'</div>' +
                '<div class="c_blue">'+depot_item.prod_name+'('+depot_item.prod_SKU+')</div>' +
                '<div class="c-orange">'+numeral(best_price).format('$ 0,0.00')+'</div>'+
            '</div>' +
            '<div class="col col-2">' + //
                '<label class="radio">' +
                   '<input type="radio" name="radio" class="container-select">' +
                   '<i></i></label>' +
            '</div>' +
        '</div>';

        return tr;
    },
    /***************************************/
    set_hidden_field:function($that,$me){
        var depot_id = $that.closest('.container-info').find('.depot_id').val()
        var depot_name = $that.closest('.container-info').find('.depot_name').val()
        var container_type_id = $that.closest('.container-info').find('.container_type_id').val()
        var container_feet_type = $that.closest('.container-info').find('.container_feet_type').val()
        var container_rate = $that.closest('.container-info').find('.container_rate').val()
        var container_type_name = $that.closest('.container-info').find('.container_type_name').val()
        var depot_address = $that.closest('.container-info').find('.depot_address').val()
        var rate_mile = $that.closest('.container-info').find('.rate_mile').val()
        var vendor_id = $that.closest('.container-info').find('.vendor_id').val()
        var prod_name = $that.closest('.container-info').find('.prod_name').val()
        var prod_id = $that.closest('.container-info').find('.prod_id').val()
        var distance = $that.closest('.container-info').find('.distance').val();

        $me.closest('tr').find('.prod_id_id').val(prod_id);
        $me.closest('tr').find('.depot_id').val(depot_id);
        $me.closest('tr').find('.depot_name').val(depot_name);
        $me.closest('tr').find('.container_type_id').val(container_type_id);
        $me.closest('tr').find('.container_feet_type').val(container_feet_type);
        $me.closest('tr').find('.container_rate').val(container_rate);
        $me.closest('tr').find('.container_type_name').val(container_type_name);
        $me.closest('tr').find('.depot_address').val(depot_address);
        $me.closest('tr').find('.rate_mile').val(rate_mile);
        $me.closest('tr').find('.vendor_id').val(vendor_id);
        $me.closest('tr').find('.prod_name').val(prod_name);
        $me.closest('tr').find('.prod_id').val(prod_id);
        $me.closest('tr').find('.distance').val(distance);
    },
    /***************************************/
    depot_available_show:function(depots,el,$me){
        var tr =''
        if(depots.length >0){
            var prv ={}; var parent=''; var children=''
            var prv_depot_name=''
            depots.forEach(function(item){
                //console.log(item)
                var best_price = (parseFloat(item.distance) * parseFloat(item.rate_mile)) + parseFloat(item.container_rate) +parseFloat(container_plus_500)
                if(prv.depot_id !=undefined){
                    if(item.depot_id != prv.depot_id){
                        prv_depot_name +='<div class="col-12 absolute-report text-black">' +prv.depot_name+
                            '<input type="hidden" class="find_depot_id" value="'+prv.depot_id+'">' +
                            '<table class="table table-bordered report m-0 t-normal tooltip_depot">' +
                                '<thead>' +
                                    '<th>Containner</th>' +
                                    '<th>Avaible quantity</th>' +
                                    '<th>Distance</th>' +
                                '</thead>' +
                                '<tbody>'+children+'</tbody>' +
                            '</table>'+
                            '</div>'
                        children =''
                    }
                    children += '<tr class="select-container" style="cursor: pointer">' +
                        '<input type="hidden" class="depot_id" value="'+item.depot_id+'">' +
                        '<input type="hidden" class="depot_name" value="'+item.depot_name+'">' +
                        '<input type="hidden" class="best_price" value="'+best_price+'">' +
                        '<input type="hidden" class="container_type_id" value="'+item.container_type_id+'">' +
                        '<input type="hidden" class="container_feet_type" value="'+item.container_feet_type+'">' +
                        '<input type="hidden" class="container_rate" value="'+item.container_rate+'">' +
                        '<input type="hidden" class="container_type_name" value="'+item.container_type_name+'">' +
                        '<input type="hidden" class="depot_address" value="'+item.depot_address+'">' +
                        '<input type="hidden" class="rate_mile" value="'+item.rate_mile+'">' +
                        '<input type="hidden" class="vendor_id" value="'+item.vendor_id+'">' +
                        '<input type="hidden" class="prod_name" value="'+item.prod_name+'">' +
                        '<input type="hidden" class="prod_SKU" value="'+item.prod_SKU+'">' +
                        '<input type="hidden" class="prod_id" value="'+item.prod_id+'">' +
                        '<input type="hidden" class="distance" value="'+item.distance+'">' +
                        '<input type="hidden" class="product_qty" value="'+item.product_qty+'">' +
                        '<input type="hidden" class="SKU" value="'+item.SKU+'">' +
                        '<input type="hidden" class="name" value="'+item.name+'">' +
                        '<input type="hidden" class="prod_photo" value="'+item.prod_photo+'">' +
                        '<input type="hidden" class="prod_class" value="'+item.prod_class+'">' +
                        '<td>'+item.prod_SKU+'</td>' +
                        '<td class="text-center">'+item.product_qty+'</td>' +
                        '<td>'+item.distance+' miles</td>' +
                        '</tr>'
                }else{
                    children += '<tr class="select-container" style="cursor: pointer">' +
                        '<input type="hidden" class="depot_id" value="'+item.depot_id+'">' +
                        '<input type="hidden" class="depot_name" value="'+item.depot_name+'">' +
                        '<input type="hidden" class="best_price" value="'+best_price+'">' +
                        '<input type="hidden" class="container_type_id" value="'+item.container_type_id+'">' +
                        '<input type="hidden" class="container_feet_type" value="'+item.container_feet_type+'">' +
                        '<input type="hidden" class="container_rate" value="'+item.container_rate+'">' +
                        '<input type="hidden" class="container_type_name" value="'+item.container_type_name+'">' +
                        '<input type="hidden" class="depot_address" value="'+item.depot_address+'">' +
                        '<input type="hidden" class="rate_mile" value="'+item.rate_mile+'">' +
                        '<input type="hidden" class="vendor_id" value="'+item.vendor_id+'">' +
                        '<input type="hidden" class="prod_name" value="'+item.prod_name+'">' +
                        '<input type="hidden" class="prod_SKU" value="'+item.prod_SKU+'">' +
                        '<input type="hidden" class="prod_id" value="'+item.prod_id+'">' +
                        '<input type="hidden" class="distance" value="'+item.distance+'">' +
                        '<input type="hidden" class="product_qty" value="'+item.product_qty+'">' +
                        '<input type="hidden" class="SKU" value="'+item.SKU+'">' +
                        '<input type="hidden" class="name" value="'+item.name+'">' +
                        '<input type="hidden" class="prod_photo" value="'+item.prod_photo+'">' +
                        '<input type="hidden" class="prod_class" value="'+item.prod_class+'">' +
                        '<td>'+item.prod_SKU+'</td>' +
                        '<td class="text-center">'+item.product_qty+'</td>' +
                        '<td>'+item.distance+' miles</td>' +
                        '</tr>'
                }
                prv = item
            });
            prv_depot_name +='<div class="col-12 absolute-report text-black">' +prv.depot_name+
                '<input type="hidden" class="find_depot_id" value="'+prv.depot_id+'">' +
                '<table class="table table-bordered report m-0 t-normal tooltip_depot">' +
                    '<thead>' +
                        '<th>Containner</th>' +
                        '<th>Avaible quantity</th>' +
                        '<th>Distance</th>' +
                    '</thead>' +
                    '<tbody>'+children+'</tbody>' +
                '</table>'+
                '</div>'

            var row_content ='<label class="c_blue">Available depots:</label>' +
                '<div>'+prv_depot_name+'</div>'
            $(el).html(row_content)
            //event
            $(el + ' .select-container').unbind('click').bind('click',function(){
                var item = {
                    distance: $(this).find('.distance').val(),
                    depot_id:$(this).find('.depot_id').val(),
                    depot_name:$(this).find('.depot_name').val(),
                    depot_address:$(this).find('.depot_address').val(),
                    vendor_id:$(this).find('.vendor_id').val(),
                    rate_mile:$(this).find('.rate_mile').val(),
                    container_type_id:$(this).find('.container_type_id').val(),
                    container_feet_type:$(this).find('.container_feet_type').val(),
                    container_type_name:$(this).find('.container_type_name').val(),
                    container_rate:$(this).find('.container_rate').val(),
                    prod_SKU:$(this).find('.prod_SKU').val(),
                    prod_id:$(this).find('.prod_id').val(),
                    prod_name:$(this).find('.prod_name').val(),
                    product_qty:$(this).find('.product_qty').val(),
                    sku:$(this).find('.SKU').val(),
                    name:$(this).find('.name').val(),
                    prod_photo:$(this).find('.prod_photo').val(),
                    prod_class:$(this).find('.prod_class').val(),
                    price:$(this).find('.best_price').val(),
                    line_total:$(this).find('.best_price').val()
                }

                $('#order_form #table_product_ordered tbody').html('')
                _orderProducts.createInputFields(item,'',item,'');
                _orderProducts.getTotalPrice();
            })
        }
    }
 }

var f_d= new find_depot();
$(function(){
    f_d.init();
});
