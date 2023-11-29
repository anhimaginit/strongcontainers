function Order() { }

var action = '';
var isUpdate = false;
var isComplete = false;
Order._order = null;
Order.prototype.constructor = Order;
window.grand_total = 0;
window.contract_overage = 0;
Order.prototype = {
  init: function (callback) {
      if (getUrlParameter('id') && document.location.href.indexOf('order-form') >= 0) {
          _Order.initUpdate(getUrlParameter('id'), function () {
              _Order.bindEvent();
          });
      } else {
          $('#form_input_order_product').show();
          $('#btnAddProduct').closest('tr').show();
          _orderProducts.createInputFields();
          _Order.bindEvent();
      }
    ///
    opTotalLine = function (price, quantity, discount, discount_type) {
      price = numeral(price).value();
      quantity = numeral(quantity).value();
      discount = numeral(discount).value();
      if (discount_type == '%') {
        return quantity * price - quantity* (price * discount / 100);
      } else {
        return (price - discount)* quantity ;
      }
    }
    setAction = function (_setAction) {
      action = _setAction;
    }

    orderNote = new NoteTable({
      form: 'Order',
      table: '#order_form #table_note_info'
    });
    orderNote.init();

    $('#form_input_order_product').hide();
    submitOrderForm = this.submitOrderForm;
    forwardToWarranty = this.forwardToWarranty;

    //new ControlSelect2(['[name=bill_to]']);
      billto_select2_el("#order_form #bill_to_ID",link._contact_search)
    /* _selectLoader = new SelectLoader();
    _selectLoader.loadDataSelectContact(link._salesmanList, 'salesperson', 'SID', getUrlParameter('repre'), function () {
      if (callback) {
        callback();
      }
    });*/
    new ControlSelect2(['[name=salesperson]']);
     // new ControlSelect2(['[name=driver]']);
    this.forwardFromContact();
  },
  bindEvent: function () {
    $("#bill_to_ID").bind('change', function () {
    //    alert("here");
        var _mydata = {};
        _mydata.token = localStorage.getItemValue('token');
        _mydata.contactID = $('#bill_to_ID').val();
        $.ajax({
            url: link._contactAddress_id,
            type: 'post',
            data: _mydata,
            dataType: 'json',
            success: function (res) {
                // load Policyholder Contact
                $("#salespersonId").val(res.contact_salesman_id).trigger('change');

                var address = ''
                address = (res.primary_street_address1 !='' && res.primary_street_address1 !=null)?res.primary_street_address1:''
                if(res.primary_city !='' && res.primary_city !=null){
                    address = (address !='')?address+', '+res.primary_city:res.primary_city
                }
                if(res.primary_state !='' && res.primary_state !=null){
                    address = (address !='')?address+', '+res.primary_state:res.primary_state
                }

               // find_depot.prototype.find_nearest_depots('','',address,'','find_depot','#order_form #avalible-depots');
                //    loadPolicyholderContact(res);
            //    loadSalesmanFolowState(res.primary_state);
            //    alert(res.contact_salesman_id);
            }
        });
    });

    $('#order_form').validate(Order.prototype.validateOrderOption);
    $('#order_form [name=salesperson]').select2({ placeholder: 'Select Salesperson' });
    $('#order_form [name=subscription]').select2();

    // $('#order_form #btnSubmitOrder').click(function(){
    //   console.log('Nothing')
    //   $('#order_form').submit();
    // });

    if (document.location.href.indexOf('order-form') >= 0) {
      $('#btnBackOrder').on('click', function () {
        window.history.back();
      });
    } else {

    }
    $('#btnForwardOrderToWarranty').hide();
    $('#btnBackContact').off('click');
    $('#btnBackContact').text('Cancel');
    $('#btnBackContact').bind('click', function () {
      $('.modal').modal('hide');
      $('#contact_form').trigger('reset');
    });

    $('.btnPaymentOrder').click(function () {
      if (Order._order) {
        let invoiceID = Order._order.ivn_id.split(',')[0];
        var other_window = window.open('./#ajax/invoice-form.php?id=' + invoiceID, '_blank');
        // setTimeout(function(){
        //   other_window.document.getElementById('display-acct-pay').click();
        // }, 2600);
      }
    });
      $('#order_form #order_zipcode').keydown(function(e){
          if(e.keyCode==13){
              $('#order_form #avalible-depots').html('')
              $('#table_product_ordered tbody').html('')
              $('#_payment').text(numeral(0).format('$ 0,0.00'));
              _orderProducts.getTotalPrice();
              if($('#table_product_ordered tbody').find('tr').length==0){
                  _orderProducts.createInputFields();
              }
              find_depot.prototype.find_nearest_depots('','',$(this).val(),'','find_depot','#order_form #avalible-depots');

          }
      });


      $('#order_form #order_zipcode').change('click',function(){
          find_depot.prototype.find_nearest_depots('','',$(this).val(),'','find_depot','#order_form #avalible-depots');
      })
  },
  initUpdate: function (id, callback) {
    if (id) {
      $.ajax({
        url: link._orderGetById,
        type: 'post',
        data: { token: localStorage.getItemValue('token'), order_id: id, jwt: localStorage.getItemValue('jwt'), private_key: localStorage.getItemValue('userID') },
        dataType: 'json',
        success: function (_order) {
          if (_order.order) {
              var quote_temp=[]
              var temp_quote =[]
              if(_order.order[0].quote_temp.length >0){
                  temp_quote = _order.order[0].quote_temp;
              }
            isUpdate = true;
            _order.products.forEach(function (prod, index) {
              prod.quantity = (prod.quantity ? prod.quantity : prod.qty ? prod.qty : 1);
              prod.discount = (prod.discount ? prod.discount : 0);
              prod.discount_type = (prod.discount_type ? prod.discount_type : '%');

              var line_total = opTotalLine(prod.price, prod.quantity, prod.discount, prod.discount_type);
              prod.line_total = numeral(prod.line_total).value();
              prod.line_total = (prod.line_total && prod.line_total - line_total == 0 ? prod.line_total : (prod.prod_class == 'Discount' ? 0.00 : line_total));

              if (prod.id || prod.prod_id) {
                  if(temp_quote.length >0){
                      for(var i=0;i<temp_quote.length;i++){
                          if(temp_quote[i].prod_id==prod.id){
                              quote_temp =  temp_quote[i];
                             // console.log(quote_temp);
                              temp_quote.splice(i,1)
                               break;
                          }
                      }
                  }
                  //console.log(quote_temp);
                  _order.order[0].payment = parseFloat(_order.order[0].payment);
                _orderProducts.createInputFields(prod, _order.order[0].payment != 0,quote_temp);

                  quote_temp=[]
              }
            });
            if (_order.order.length > 0) {
                if(_order.order[0].order_zipcode !=null && _order.order[0].order_zipcode !=''){
                    find_depot.prototype.find_nearest_depots('','',_order.order[0].order_zipcode,'','find_depot','#order_form #avalible-depots');
                }

              $('#heading_title_id').text(_order.order[0].order_title ? _order.order[0].order_title : _order.order[0].order_id);
              var addr = _order.order[0].b_address1+" "+_order.order[0].b_primary_city+" "+_order.order[0].b_primary_state
              $('#order_form [name=bill_to]').append('<option value="'+_order.order[0].bill_to +'" address="'+addr+'" selected >' + _order.order[0].b_first_name + ' ' + _order.order[0].b_last_name + ' - ' + _order.order[0].b_primary_state + '</option>').trigger('change');

              for (var key in _order.order[0]) {
                  $('#order_form [name=' + key + ']').val(_order.order[0][key]).trigger('change');
              }

              if (_order.order[0].discount_code) {
                orderDiscount.searchDiscount(_order.order[0].discount_code);
              }

              if (_order.order[0].subscription && _order.order[0].subscription.subscription) {
                $('#order_form [name=subscription]').val(_order.order[0].subscription.subscription).trigger('change');
                template_field = _order.order[0].subscription;
                $('#order_form [name=offSecondPayFee]').prop('checked', template_field.offSecondPayFee);
                $('#order_form [name=optionPayingLater]').prop('checked', template_field.optionPayingLater);
              }

              Order._order = _order.order[0];
              Order._order.products = _order.products;

              if (_order.order[0].warranty != '0' && _order.order[0].warranty != '') {
                window.order_warranty_id = _order.order[0].warranty;
                // $('#btnAddProduct').closest('tr').remove();
                // $('#form_input_order_product').empty();
                $('#pane_link_to_warranty').html('<a href="' + host2 + '#ajax/warranty-form.php?id=' + _order.order[0].warranty + '">The order used for warranty: ' + (_order.order[0].order_title ? _order.order[0].order_title + ' - ' : '') + _order.order[0].warranty + ' <i class="fa fa-external-link"></i> </a>')
                $('#pane_link_to_warranty').addClass('padding-10');
              }
              if (parseFloat(_order.order[0].balance) != parseFloat(_order.order[0].total)) {
                //   $('#btnAddProduct').closest('tr').remove();
                //   $('#form_input_order_product').empty();
                // } else {
                //   $('#form_input_order_product').show();
                //   $('#btnAddProduct').closest('tr').show();
              }

              if (_order.order[0].ivn_id) {
                var s_href = [];
                _order.order[0].ivn_id.split(',').forEach(function (item) {
                  s_href.push('<a href="#ajax/invoice-form.php?id=' + item + '">Invoice-' + item + '</a>');
                });

                $('#pane_link_to_invoice').html('The order used for invoice: ' + s_href.join(', '));
                $('#pane_link_to_invoice').addClass('padding-10');
              } else {
                $('#order_form .btnPaymentOrder').remove();
              }
              if (_order.order[0].notes != undefined && _order.order[0].notes.length > 0) {
                orderNote.displayList(_order.order[0].notes);
              }
                var total_table =0;
                if(_order.products !=undefined){
                    if(_order.products.length >0 ){
                        _order.products.forEach(function(item){
                            total_table += parseFloat(item.line_total)
                        })
                    }
                }

                var payment = parseFloat(_order.order[0].total) - parseFloat(_order.order[0].payment);
                if(payment < 0) payment =0;
                    _orderProducts.displayFooter({
                  total_table:total_table,
                paid: _order.order[0].payment,
                        payment:payment,
                total: _order.order[0].total,
                grand_total: _order.order[0].grand_total,
                contract_overage: _order.order[0].contract_overage
              });
              window.grand_total = numeral(grand_total).value();
              window.contract_overage = numeral(_order.order[0].contract_overage).value();
              if (_order.order[0].payment != 0 && _order.order[0].payment != '0') {
                $('#notify_order').html('<h3 class="receipt-payment">Receipt Payment</h3>' +
                  '<div class="bold" style="padding-top:5px; padding-bottom:5px;"><b>Payment: </b><label style="width:120px; text-align:right;">' + numeral(_order.order[0].payment).format('$ 0,0.00') + '</label></div>' +
                  '<div class="bold" style="padding-top:5px; padding-bottom:5px;"><b>Balance: </b>&nbsp;<label style="width:120px; text-align:right;">' + numeral(_order.order[0].balance).format('$ 0,0.00') + '</label></div>')
                $('#table_product_ordered input, #table_product_ordered select').unbind('change click');
                $('#table_product_ordered input, #table_product_ordered select').each(function () {
                  $(this).closest('td').removeClass('hasinput input');
                  $(this).replaceWith(this.value);
                });
                $('#order_form select').each(function (index, elem) {
                  if (elem.value == '' && $(elem).prop('name') == 'subscription') {
                    $(elem).closest('fieldset').remove();
                  } else {
                    var it = $('<span class="label-input ' + $(elem).prop('name') + '">' + $(elem).find('option:selected').text() + '</span>');
                    it.replaceAll(elem);
                  };
                });

                var _buyer = _order.order[0].b_first_name ? _order.order[0].b_first_name : '';
                _buyer += _order.order[0].b_last_name ? ' ' + _order.order[0].b_last_name : '';
                $('.bill_to').text(_buyer);

                var _sale = _order.order[0].s_first_name ? _order.order[0].s_first_name : '';
                _sale += _order.order[0].s_last_name ? ' ' + _order.order[0].s_last_name : '';
                $('.salesperson').text(_sale);

                $('#order_form input:text, #order_form textarea').each(function (index, elem) {
                  if (elem.value == '' && ['discount_code'].includes($(elem).prop('name'))) {
                    $('#discount_pane').remove();
                    $(elem).closest('div.row').remove(); //anh
                  } else if ($(elem).closest('#note_mail_popup')[0]) {
                  } else {
                    var it = $('<span class="label-input">' + elem.value + '</span>');
                    it.replaceAll(elem);
                  }
                });

                  if(_order.order[0].discount_code !=null && _order.order[0].discount_code !=''){
                      var discount_cd = numeral(_order.order[0].discount_code_total).format('$ 0,0.00')
                      $('#order_form #discount_code').text(discount_cd)
                      $('#order_form #discount-code-text').text('Discount code:('+_order.order[0].discount_code+')')
                  }
                // $('#order_form #table_product_ordered thead tr:last').remove();
                $('#order_form .select2').remove(); //anh
                $('#discount_pane').hide();
                $('#btnAddContactOrder1').remove();
                //$('#btnSubmitOrder').remove(); anh
                $('#btnForwardOrderToWarranty').remove();
                //$('.smart-form .paid-copleted').remove()
                $('.smart-form .input').removeClass('input'); //anh

                if (_order.order[0].balance > 0) {
                  $('#order_form').parent().prepend('<p class="alert alert-notify">The order is paying. You cannot edit anything</p>')
                } else {
                  isComplete = true;
                  $('.btnPaymentOrder').closest('div.row').remove();
                  $('#order_form').parent().prepend('<p class="alert alert-notify">This order has been completed payment, You are only allowed to view</p>')
                }
              } else {
                //_orderProducts.checkDisplayHasWarranty();
                //Order is completed payment
               // _orderProducts.createInputFields();
              }

                if(_order.order[0].s_ID !=null){
                    setTimeout(function(){
                        $('#salespersonId').append('<option value="'+ _order.order[0].s_ID + '" selected>' + _order.order[0].s_first_name + ' ' + _order.order[0].s_last_name + '</option>').trigger('change');
                    },600)
                }

                /*if(_order.order[0].driver_id !=null){
                    setTimeout(function(){
                        $('#driverId').append('<option value="'+ _order.order[0].driver_id + '" selected>' + _order.order[0].d_first_name + ' ' + _order.order[0].d_last_name + '</option>').trigger('change');
                    },500)
                }*/

                $('#order_form .is-new-order').css({"display":""})
                if(_order.order[0].order_doors != null){
                    $("#order_form #order_doors option[value='"+_order.order[0].order_doors+"']").prop("selected", "selected");
                }
                if(_order.order[0].order_releases != null){
                    $('#order_form #order_releases').val(_order.order[0].order_releases)
                }
                if(_order.order[0].order_status != null){
                    $('#status-waiting-confirm').val("")
                    $("#order_form #order_status option[value='"+_order.order[0].order_status+"']").prop("selected", "selected");
                   if(_order.order[0].order_status == 'CANCELLED' || _order.order[0].order_status == 'CLOSE'){
                       $('select').prop('disabled', true);
                       $("input").prop('disabled', true);
                       $('button').prop('disabled', true);
                   }else if(_order.order[0].order_status == 'WAITING_CONFIRM'){
                       $('#btnSubmitOrder').remove()
                       $('#btn-confirm-order').remove()
                       $('#order-form-footer').append('<button type="submit" class="btn btn-primary" id="btn-confirm-order" onmousedown="setAction(`submit`)" form="order_form">Wating confirm</button>')
                        $('#status-waiting-confirm').val("1")
                   }
                }
            }
          } else {
            messageForm('No data found with order id = ' + id + ', please choose another id', false, '#order_form #message_form');
            $('#form_input_order_product').show();
            $('#btnAddProduct').closest('tr').show();
            return;
          }
        }
      })
      if (callback) callback()
    }
  },

  validateOrderOption: {
    // ignore: [],
    rules: {
      bill_to: { required: true },
      salesperson: { required: true },
      // warranty: { required: true, number: true },
    },
      messages: {
          bill_to: { required: 'Require bill to' },
          salesperson:{required: 'Salesperson'}
      },
    submitHandler: function (e) {
      if (isComplete) {
        return;
        // document.location.href = "./#ajax/warranty-form.php?orderid=" + $('[name=order_id]').val();
        // location.reload();
      } else {
        Order.prototype.submitOrderForm().then(function (_data) {
          if (action == 'forward' && _data.value.ID != undefined) {
            if (_data.action == 'Add') {
              _href = "./#ajax/warranty-form.php?orderid=" + _data.value.ID;
              $('[name=order_id]').val(_data.value.ID);
              responseSuccessForward('You have successfully added the new order', true, '#order_form #message_form', _href, 'Forward to warranty');

                return
            } else if (_data.action == 'Edit') {
              _href = "./#ajax/warranty-form.php?id=" + _data.warranty + "&&orderid=" + _data.value.ID;
              responseSuccessForward('You have successfully edited the order', true, '#order_form #message_form', _href, 'Forward to warranty');
            }
          } else {
            if (window.opener != undefined) {
              window.close();
              return;
            }
            if (document.location.href.indexOf('order-form') > 0) {
              if (_data.value.ID && (!$('#order_form [name=order_id]').val() || $('#order_form [name=order_id]').val() == '' || $('#order_form [name=order_id]').val() == '0')) {
                _href = host2 + "#ajax/order-form.php?id=" + _data.value.ID;
                $('#order_form [name=order_id]').val(_data.value.ID);
                responseSuccessForward('You have successfully created the order', true, '#order_form #message_form', _href, 'Go to edit order');
              } else {
                messageForm('You have successfully edited the order', true, '#order_form #message_form');
              }
            } else if (document.location.href.indexOf('warranty-form') > 0) {
              messageForm('You have successfully created the order', true, $('#tb_product_show').parent().find('.message_table'));
              if (!_data.value.order.order_title || _data.value.order.order_title == '') {
                _data.value.order.order_title = 'Warranty Order ' + _data.value.ID;
              }

              var newOption = new Option(_data.value.order.order_title, _data.value.ID, false, false);
              $('#warranty_order_id').append(newOption).trigger('change');
              new Warranty().search_order(_data.value.ID);

              hasWarranty = false;
              hasWarrantyIndex = -1;
              productSelected = {};
              productSelectArray = [];

              $('#table_product_ordered tbody').empty();
              _orderProducts.createInputFields();

              _orderProducts.getTotalPrice();


              $('.modal').modal('hide');
            }
          }
        }).catch(function (e) {
         // console.log(e);
          messageForm('Error! An error occurred. Please try later', false, '#order_form #message_form');
        });
      }
    }
  },

  submitOrderForm: function () {
    return new Promise(function (resolve, reject) {
      var _formData = $.extend({}, template_data);
      var _data = $("#order_form").serializeArray()
      _data.forEach(function (elem) {
        if (elem.name != '' && elem.value != '') {
          _formData[elem.name] = elem.value;
        }
      });
      _formData.notes = orderNote.getNotes();
      _formData.salesperson = $('[name=salesperson]').val();
        var discount_code_value =0;
        if($('#_discount_code').text() !=undefined){
            discount_code_value = numeral($('#_discount_code').text()).value()
        }

      _formData.total = numeral($('#_total_table').text()).value() - discount_code_value + numeral($('#_discount').text()).value();

      _formData.order_total = _orderProducts.getTotalPrice();
      _formData.balance = (_formData.order_total - numeral(_formData.payment).value());
      if (_formData.payment == 0) _formData.createTime = getDateTime();
      if (Order._order && Order._order.payment != 0 && Order._order.order_id) {
        _formData.products_ordered = Order._order.products
      } else {
        _formData.products_ordered = _orderProducts.getProductsData();
      }
      if (_formData.products_ordered.length == 0) {
        messageForm('Please select least a product', false);
        return reject('Please select least a product');
      }

      /** grand total & contract overage */
      _formData.contract_overage = window.contract_overage || 0;
      _formData.grand_total = window.grand_total;

      _formData.updateTime = new Date();
      /** subscription */
      _formData.subscription = _billing.getSubscription();

      _link = link._orderAddNew;
      if ((_formData.order_id && document.location.href.indexOf('order-form') >= 0 && isUpdate == true)) {
        _link = link._orderEdit;
      } else {
        delete _formData.order_id;
      }
      delete _formData.prod_name;
      delete _formData.SKU;
      delete _formData.id;
      if (Order._order) {
        for (var key in Order._order) {
          var includeKey = ['order_title', 'bill_to', 'salesperson'];
          if (_formData[key] == undefined && includeKey.includes(key)) {
            _formData[key] = Order._order[key];
          }
        }
      }

        var data_post = [];
        $("#order_form #table_product_ordered tbody tr").each(function(){
           // if($(this).find('.check-rate').is(":checked")){
                var object = {
                    depot_id : $(this).find('.depot_id').val(),
                    depot_name : $(this).find('.depot_name').val(),
                    best_price :numeral($(this).find('.total-line').val()).value(),
                    container_type_id: $(this).find('.container_type_id').val(),
                    container_rate : $(this).find('.container_rate').val(),
                    container_type_name : $(this).find('.container_type_name').val(),
                    depot_address : $(this).find('.depot_address').val(),
                    rate_mile : $(this).find('.rate_mile').val(),
                    qty : $(this).find('.quantity').val(),
                    vendor_id : $(this).find('.vendor_id').val(),
                    prod_id : $(this).find('.prod_id').val(),
                    prod_name : $(this).find('.prod_name').val(),
                    prod_SKU : $(this).find('.SKU_search').val(),
                    distance : $(this).find('.distance').val()
                }

                data_post.push(object);
           // }
        });
        _formData.data_post=data_post
        if($('#status-waiting-confirm').val()=='1') _formData.order_status = "OPEN"

        // console.log(_formData); return

      Order._order = _formData;
      if ((parseInt(_formData.total) >= parseInt(_formData.payment))) {
        $.ajax({
          url: _link,
          type: 'post',
          data: _formData,
          success: function (res) {
            if (!res.startsWith('{')) {
              messageForm('Error! An error occurred. Please try later', false);
              reject(res);
            } else {
              var tmp = JSON.parse(res);
              if (tmp["SAVE"] == 'FAIL') {
                reject(tmp['ERROR']);
              } else if (tmp["SAVE"] == 'SUCCESS') {
                if (_link == link._orderAddNew) {
                  resolve({ action: 'Add', value: { ID: tmp.ID, order: _formData }, warranty: 0 });
                } else {
                  resolve({ action: 'Edit', value: { ID: _formData.order_id, order: _formData }, warranty: _formData.warranty })
                }
              }
            }
          }
        })
      }
    })
  },
  forwardFromContact: function () {
    if (getUrlParameter('contactid')) {
      var bill_to = getUrlParameter('contactid');
      var buyer_name = getUrlParameter('contactname');
      $('select[name="bill_to"]').append('<option value="' + bill_to + '">' + buyer_name + '</option>').trigger('change');

    }
  }

}

var _Order = new Order();
$(function(){
    _Order.init();
});

function cancelEdit() {
  $('#edit_product_form').css('display', 'none');
}
// $('input, select, texterea').click(function () { $('#message_form').empty().hide(200) });
// loadScript('js/util/control-select2.js', Order);