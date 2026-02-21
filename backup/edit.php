<?php

$link = mysqli_connect("mysql.issp.eu", "johoelzl_mysql2", "rcv9m6h3", "johoelzl_mysql2");

	if (!$link) {
	    echo "Error: Unable to connect to MySQL." . PHP_EOL;
	    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
	    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
	    exit;
	}


if ( isset($_POST['submit']) ) { 
	
	$move_title = $_POST['move_title'];
	$move_synonym = $_POST['move_synonym'];
	$move_description = $_POST['move_description'];
	$move_link = $_POST['move_link'];
	$move_id = $_POST['move_id'];
	
	
	// Insert Move
	$link->query("SET NAMES 'utf8'");
	//$link->query("SET CHARACTER SET 'utf8'");  
	$link->query("UPDATE moves set name =  '". $move_title ."', synonyms= '". $move_synonym . "', description=  '" . $move_description . "',  link=  '" . $move_link . "' where move_id = '" . $move_id . "' ");
	
	
	$link->query("DELETE FROM moves_to_tags where move_id = '" . $move_id . "' ");
	
	foreach (array_keys($_POST) as &$item) {
		
		if (strpos($item, 'move_tag_') !== false) {
			$tag_id = str_replace("move_tag_","",$item);
			$link->query("INSERT INTO moves_to_tags (move_id,tag_id) VALUES ('". $move_id ."','". $tag_id . "')");
	
		}	
		
	}
	
	if ( isset($_POST['tag_filter']) ) { 
		$tag_filter = $_POST['tag_filter'];
	} else {
		$tag_filter = "10";
	}
	
	$link_addition = "?tag_filter=". $tag_filter;
	
	if ( isset($_POST['adminmode']) ) { 
		$link_addition.= '&adminmode=1';
	}	
	

	header('Location: index.php' . $link_addition . '&save=1');
	
	
	
	
	
}
	
	
// Link Addition for Back Button
if (isset($_GET['tag_filter'])) { 
	$tag_filter_get = $_GET['tag_filter'];

} else {
	$tag_filter_get = "10";

}

$link_addition_get = "?tag_filter=". $tag_filter_get;

if ( isset($_GET['adminmode']) ) { 
	$link_addition_get.= '&adminmode=1';
}	
	
?>


<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">

    <title>Edit Move</title>
  </head>
  <body>
	  
		  
	  <br>
    <div class="container">
	    
	    <?php 
		    
		    
		    if (isset($_POST['submit']) ) {

			    
			     ?>
		    <div class="alert alert-success" role="alert">Move was saved!</div>

		    
		    <?php
			    
			    } else {
				    
				  
				
	
	$sql = "SELECT * from moves where move_id = '" . $_GET['move_id'] . "'";
	$result = $link->query($sql);

    while($row = $result->fetch_assoc()) {
	    
		$move_title = $row['name'];
		$move_synonym= $row['synonyms'];
		$move_description = $row['description'];
		$move_link = $row['link'];
  
	}
			    
			    ?>
	    
<form action="edit.php" method="post">
	 <input type="hidden" id="move_id" name="move_id" value="<?php echo $_GET['move_id'];?>">
	  <input type="hidden" id="tag_filter" name="tag_filter" value="<?php echo $_GET['tag_filter'];?>">
	  
	  <?php if ( isset($_GET['adminmode']) ) {
		echo '<input type="hidden" id="adminmode" name="adminmode" value="1">';
	} ?> 
	
	
  <div class="form-group">
    <label for="move_title">Title</label>
    <input name="move_title" type="text" class="form-control" value="<?php echo $move_title;?>" id="move_title" aria-describedby="move_title_help">
  </div>
   <div class="form-group">
    <label for="move_synonym">Synonym</label>
    <input type="text" class="form-control" value="<?php echo $move_synonym;?>" name="move_synonym" id="move_synonym" aria-describedby="move_synonym_help">
    <small id="move_synonym_help" class="form-text text-muted">Other names of this move</small>
  </div>
   <div class="form-group">
    <label for="move_description">Description</label>
    <textarea class="form-control" name="move_description"  id="move_description" placeholder="Detailed description for leaders" rows="3"><?php echo utf8_encode($move_description);?></textarea>
  </div>
  
   <div class="form-group">
    <label for="move_synonym">Link</label>
    <input type="text" class="form-control" value="<?php echo $move_link;?>" name="move_link" id="move_link" aria-describedby="move_link_help">
    <small id="move_link_help" class="form-text text-muted">Youtube, etc.</small>
  </div>
  
 

  
  
  <?php
	
		// Tags grouped by Type
	$sql = "SELECT tag_type_id, tag_type_name, tag_type_css from tag_types order by sort_order";
	$result0 = $link->query($sql);

	 
	while($row0 = $result0->fetch_assoc()) {
		
		echo '<div style="' . $row0['tag_type_css'] . '">'; // . $row0['tag_type_name'];
		
	
		$sql = "SELECT t.tag_id, t.tag_name, t.tag_label, mt.tag_id as checked from tags t
		left outer join moves_to_tags mt on (mt.move_id = '". $_GET['move_id'] . "' and mt.tag_id = t.tag_id)
		where t.tag_type_id = '" . $row0['tag_type_id']. "'
		order by t.tag_sort, t.tag_name";
		$result = $link->query($sql);
	
	    while($row = $result->fetch_assoc()) {
		    
		   	
		   	 echo '  <div class="form-check form-check-inline form-control-lg">
		    <input type="checkbox" class="form-check-input" id="move_tag_'. $row['tag_id']. '" name="move_tag_'. $row['tag_id']. '"';
		    
		    if ($row['checked']) {
			    echo ' checked';
		    }
		    
		    echo '>
		    <label class="form-check-label" for="tag_' . $row['tag_id'] . '"><span class="badge badge-' . $row['tag_label'] . '">' . $row['tag_name'].'</span></label>
		  </div>';
	  
		}
		
		echo '</div>';
		
	}
		    
	?>

  

  <br><br>

  
  <p>
	    <a href="index.php<?php echo $link_addition_get;?>"><button type="button" class="btn btn-outline-primary">Go back</button></a>
	  <button name="submit" type="submit" class="btn btn-primary">Save Move!</button>
	  
	  </p>
</form>




<?php
	
	} 
	
	mysqli_close($link);  
		
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