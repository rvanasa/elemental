import React, {useContext, useState} from 'react';

import WorldContext from '../contexts/WorldContext';
import ScaleText from 'react-scale-text';
import Color from 'color';
import classNames from 'classnames';
import {useDrag, useDrop} from 'react-dnd';
import {FaFire, FiWind, GiStoneBlock, GiWaterDrop} from 'react-icons/all';
import useListener from '../hooks/useListener';
import './Element.scss';
import SelectionContext from '../contexts/SelectionContext';
import useRedraw from '../hooks/useRedraw';

const ICONS = [FiWind, GiStoneBlock, FaFire, GiWaterDrop];

export default function Element({element, count, compact, onDrop, onClick}) {

    let redraw = useRedraw();

    let world = useContext(WorldContext);
    let {selected, setSelected} = useContext(SelectionContext);

    useListener(world, 'element:' + element.id, redraw);

    let [{isDragging}, drag] = useDrag({
        item: {
            type: 'ELEMENT',
            element,
            count,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    let [{isDropping, dropRecipe/*, dropItem*/}, drop] = useDrop({
        accept: ['ELEMENT'],
        canDrop(item) {
            // if(!world.getRecipe(element, item.element)) {
            //     return false;
            // }
            return !element.local && !item.element.local;
        },
        drop(item) {
            onDrop && onDrop(item);
        },
        collect: (monitor) => ({
            isDropping: monitor.isOver() && monitor.canDrop(),
            dropRecipe: monitor.getItem() && world.getRecipe(element, monitor.getItem().element),
            // dropItem: monitor.getItem(),
        }),
    });

    let elementColor = Color(element.color);
    let isDark = elementColor.isDark();
    let textColor = isDark ? '#FFF' : '#000';

    let style = {
        width: 80,
        height: compact ? 40 : 80,
        verticalAlign: 'top',
        lineHeight: 1,
        background: element.color,
        color: textColor,
        fontSize: 20,
        borderRadius: 8,
        boxShadow: '1px 4px #0004',
        textShadow: isDark && '1px 2px #0004',
        overflowWrap: 'break-word',
        transform: onDrop && (isDragging || (isDropping && dropRecipe && !dropRecipe.local)) && 'scale(.8)',
        // animation: 'element-wiggle .5s ease-out',
    };

    onClick = onClick || (elem => !elem.primitive && setSelected(/*selected === elem ? null : */elem));////////////

    let Icon = ICONS[element.id];

    return (
        <span ref={onDrop && drop} className="d-inline-block p-1">
            <span ref={onDrop && drag}
                  className={classNames('d-inline-block p-1 text-center noselect', (onDrop && 'grabbable') || (onClick && 'clickable'))}
                  style={style}
                  onClick={e => onClick && (e.stopPropagation() & onClick(element))}>
                <div className="d-inline-block" style={{height: 40}}>
                    <ScaleText maxFontSize={20} minFontSize={14}>{element.name || '(?)'}</ScaleText>
                </div>
                {!compact && (
                    <div className="h5" style={{opacity: .8}}>
                        {count ? <><small>x</small>{count}</> : Icon && <Icon/>}
                    </div>
                )}
            </span>
        </span>
    );
};
