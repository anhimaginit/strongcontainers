<?php require_once 'inc/init.php'; 
$_typesearch = "order";
include('search_message.php');
?>
<section id="widget-grid" class="">
	<!-- row -->
	<div class="row" id="order-list-content">

		<!-- NEW WIDGET START -->
		<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12">

			<!-- Widget ID (each widget will need unique ID)-->
			<div class="jarviswidget" data-widget-editbutton="false">
				<header>
               <h2><i class="fa fa-table"></i> Order list </h2>
					<?php if(canAddForm('OrderForm')){ ?>

               <a href="./#ajax/order-form.php" class="btn btn-primary pull-right"><i class="fa fa-plus"></i> Create new Order</a>
					<?php }?>
				</header>
				<div>
					<div class="jarviswidget-editbox">
					</div>
					<div class="widget-body">
                        <div class="modal fade" id="task-modal"  role="dialog"  aria-hidden="true">
                            <div class="modal-dialog" style="min-width:60%;">
                                <div class="modal-content">
                                    <?php
                                    include 'task.php'; ?>
                                </div>
                            </div>
                        </div>

                        <div class="modal fade animated fadeInDown" style="display:none; margin:auto;" id="modal-pay-to-salesperson">
                            <div class="modal-dialog modal-lg modal-dialog-centered">
                                <div class="modal-content">
                                    <div class="modal-body" style="margin:auto">
                                        <?php
                                        include 'payment_form.php';
                                        ?>
                                        <div class="row m-t20 m-b20 text-center m-rl">
                                            <div class="col col-12 border-groove p-t20">
                                                 <span class="m-r20">
                                                 <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                            </span>
                                             <span>
                                                 <button type="button" class="btn btn-primary btn-sm btn-sale-payment">Submit</button>
                                             </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
						<?php $event = 'loadTable'; include('search-table.php');?>
						<table id="table_order" class="table table-striped table-bordered table-hover" width="100%">
							<thead>
								<tr>
									<th class="hasinput"><input class="form-control" name="order_title" placeholder="Title"></th></th>
									<th class="hasinput"><input class="form-control" name="b_name" placeholder="Bill"></th>
									<th class="hasinput"><input class="form-control" name="s_name" placeholder="Salesperson"></th>
                                    <th class="hasinput"><input class="form-control" name="container" placeholder="Container"></th>
                                    <th class="hasinput"><input class="form-control" name="driver" placeholder="Driver"></th>
									<th class="hasinput"><input class="form-control" name="total" placeholder="Total"></th>
									<th class="hasinput"><input class="form-control" name="payment" placeholder="Payment"></th>
									<th class="hasinput"><input class="form-control" name="balance" placeholder="Balance"></th>
									<th class="hasinput hidden"><input class="form-control" name="balance" placeholder="Invoice Date"></th>
									<th class="hasinput"><input class="form-control" name="balance" placeholder="Create Date"></th>
								</tr>
								<tr>
									<th> #&nbsp;Order </th>
									<th>Bill To</th>
									<th>Salesperson</th>
                                    <th>Container</th>
                                    <th>Driver</th>
									<th>Total</th>
									<th>Payment</th>
									<th>Balance</th>
									<th class="hidden">Invoice Date</th>
									<th>Create Date</th>
								</tr>
							</thead>
							<tbody>
                     </tbody>
						</table>
						<div class="text-right" style="margin-right:15px;"><ul class="pagination"></ul></div>
					</div>
					<!-- end widget content -->
				</div>
				<!-- end widget div -->
			</div>
			<!-- end widget -->
		</article>
	</div>
</section>
<script src="<?php echo ASSETS_URL; ?>/js/script/pagination.js"></script>
<script src="<?php echo ASSETS_URL; ?>/js/script/order-list.js"></script>
<script src="<?php echo ASSETS_URL; ?>/js/script/orders_list.js"></script>