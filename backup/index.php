<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">

    <title>Moves</title>
    <script src="https://kit.fontawesome.com/c5179cb799.js" crossorigin="anonymous"></script>
  </head>
  <body>
	  <br>
    <div class="container">


<?php
	
	if ( isset($_GET['tag_filter']) ) { 
		$tag_filter = $_GET['tag_filter'];
	} else {
		$tag_filter = "10";
	}
	
	$link_addition = "?tag_filter=". $tag_filter;
	
	if ( isset($_GET['adminmode']) ) { 
		$link_addition.= '&adminmode=1';
	}	
	
	

	
	   
	
	
	?>
	
	
<div style="display: flex;justify-content: center;"><p><a class="btn btn-primary btn-lg" href="index.php<?php echo $link_addition;?>" role="button">I'm out of Moves!</a></p></div>


<?php
	if ( isset($_GET['save']) ) { 
		?>
 <div class="alert alert-success" role="alert">Move was saved!</div>
 <?php 
 }
 
?>

<div class="accordion" id="accordionExample">
	<?php
	
	
	
	$link = mysqli_connect("mysql.issp.eu", "johoelzl_mysql2", "rcv9m6h3", "johoelzl_mysql2");

	if (!$link) {
	    echo "Error: Unable to connect to MySQL." . PHP_EOL;
	    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
	    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
	    exit;
	}
	
	if ($tag_filter == "All") {
		$query_filter = '';
	}	
	else {
		
		$query_filter = " where m.move_id IN (Select move_id from moves_to_tags where tag_id = '" . $tag_filter . "')";
	}
	
	
	
	// Tag Filter
	$sql = "SELECT tag_type_id, tag_type_name from tag_types order by sort_order";
	$result0 = $link->query($sql);
	$tag_content = '<option value="All">All</option>';
	 
	while($row0 = $result0->fetch_assoc()) {
		
		
		$tag_content.= '<option value="0" disabled>-- ' . $row0['tag_type_name'] . ' --</option>';

		
		$sql = "SELECT tag_id, tag_name from tags where tag_type_id = '" . $row0['tag_type_id'] . "' order by tag_sort, tag_name";
		$result = $link->query($sql);
		 
		while($row = $result->fetch_assoc()) {
		    
		    $tag_content.= '<option value="' . $row['tag_id']. '"';
		    if ($tag_filter == $row['tag_id']) {
			    $tag_content.= " selected";
			}
			   
			$tag_content.= '>' . $row['tag_name'] . '</option>';
		    
		}
	}
		
	
	$sql = "SELECT m.move_id from moves m $query_filter";
	$result = $link->query($sql);
	$total_moves = $result->num_rows;
		
	if ( isset($_GET['showall']) ) { 
		$query_end = 'ORDER BY move_id desc ';
	} else {
		$query_end = 'ORDER BY RAND() LIMIT 2';
	}
	
	
	
	
		
	$sql = "SELECT m.move_id, m.name, m.synonyms, m.description, m.link,
	GROUP_CONCAT(t.tag_name, '|' , t.tag_label order by tt.sort_order, t.tag_sort, t.tag_name) as tags
	from moves m
	left outer join moves_to_tags mtt on mtt.move_id = m.move_id
	left outer join tags t on t.tag_id = mtt.tag_id
	left outer join tag_types tt on tt.tag_type_id = t.tag_type_id
	$query_filter
	GROUP BY m.move_id
	$query_end";
	
	$result = $link->query($sql);
	
	if ($result->num_rows > 0) {
	    $counter = 1;
	    while($row = $result->fetch_assoc()) {
			
			$synonym = '';
			if ($row["synonyms"]){
				$synonym = '<span style="color:gray;font-size:smaller;">, '. $row["synonyms"] . '</span>';
			}
			
			$link = '';
			if ($row["link"]){
				$link = '<p>Link: <a href="' . $row["link"] . '" target="_blank">'. $row["link"] . '</a></p>';
			}
			
			
			$tags = '';
			if ($row["tags"]){
				$tag_array = explode(',', $row["tags"]);
				foreach ($tag_array as &$value) {
					$tag_detail = explode('|', $value);
					$tags.= ' <span style="" class="badge badge-' . $tag_detail[1].'">'. $tag_detail[0].'</span>';
				}
			}
	        
	        	echo 
	        		'<div class="card">
				    	<div class="card-header" id="heading' . $row["move_id"].'">
							<h5 class="mb-0">
							<button class="btn" type="button" style="white-space:normal;" data-toggle="collapse" data-target="#collapse' . $row["move_id"] . '" aria-expanded="true" aria-controls="collapse'. $row["move_id"] . '">
							<h5>'. $row["name"] .  $synonym . $tags . '
							</h5></button>';
							
							if ( isset($_GET['adminmode']) ) { 
								echo '<span style="float:right;"><a style="color:#6c757d;" href="edit.php' . $link_addition .'&move_id=' . $row["move_id"] .'"><i class="fas fa-edit"></i></a></span>';
							}
							echo '
							</h5>
						</div>
				
						<div id="collapse' . $row["move_id"] . '" class="collapse" aria-labelledby="heading'. $row["move_id"] .'" data-parent="#accordionExample">
							<div class="card-body">' . nl2br(utf8_encode($row["description"])). $link  . '
							</div>
						</div>
					</div>';
				  $counter++;
	    }
	} else {
	    echo '<div class="alert alert-warning" role="alert">
No Moves found!
</div>';
	}



  



	?>
	<br>
	
	<form action="index.php" method="get">
  <div class="form-group">
	  <?php if ( isset($_GET['adminmode']) ) {
		echo '<input type="hidden" id="adminmode" name="adminmode" value="1">';
	} ?> 
	   
	    <?php if ( isset($_GET['showall']) ) {
		echo '<input type="hidden" id="showall" name="showall" value="1">';
	} ?> 
	
    <select class="form-control" id="tag_filter" name="tag_filter" onchange="this.form.submit()">      
      <?php echo $tag_content; ?>     
    </select>
  </div>

</form>

  </div>

<?php 
		mysqli_close($link);
	
	echo '<div style="margin-top:20px;display:flex;justify-content:center;"><a href="index.php' .  $link_addition . '&showall=1">' . $total_moves . " Moves available</a></div>"; ?>
<?php
	if ( isset($_GET['adminmode']) ) { 
		?>
<div style="margin-top:20px;display:flex;justify-content:center;"><p><a href="new.php<?php echo $link_addition;?>"><button type="button" class="btn btn-outline-primary">Add Move</button> </a></p></div>
<?php
	}
	?>


</div>
<br>
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
  </body>
</html>