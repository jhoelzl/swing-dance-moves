-- Apply to existing databases before deploying the tag-group reorder controls.
CREATE OR REPLACE FUNCTION public.move_tag_group(p_group_id integer, p_direction integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    group_ids integer[];
    current_position integer;
    target_position integer;
    other_id integer;
BEGIN
    IF p_direction IS NULL OR p_direction NOT IN (-1, 1) THEN
        RAISE EXCEPTION 'Invalid tag group direction';
    END IF;

    PERFORM tag_type_id FROM public.tag_types ORDER BY tag_type_id FOR UPDATE;
    SELECT array_agg(tag_type_id ORDER BY sort_order, tag_type_id)
      INTO group_ids FROM public.tag_types;
    current_position := array_position(group_ids, p_group_id);
    IF current_position IS NULL THEN
        RAISE EXCEPTION 'Tag group not found';
    END IF;
    target_position := current_position + p_direction;
    IF target_position < 1 OR target_position > cardinality(group_ids) THEN
        RETURN;
    END IF;

    other_id := group_ids[target_position];
    group_ids[target_position] := group_ids[current_position];
    group_ids[current_position] := other_id;
    UPDATE public.tag_types AS tag_type
       SET sort_order = ordered.position - 1
      FROM unnest(group_ids) WITH ORDINALITY AS ordered(id, position)
     WHERE tag_type.tag_type_id = ordered.id;
END;
$$;

REVOKE ALL ON FUNCTION public.move_tag_group(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.move_tag_group(integer, integer) TO authenticated;
