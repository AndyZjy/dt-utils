/**
 * 树形布局计算
 */
const layout = {
    /**
   * 获取页面宽度
   * @return {[type]} [description]
   */
    pageWidth () {
        return Math.max(
            document.documentElement.clientWidth,
            window.innerWidth || 0
        );
    },

    /**
* 获取页面高度
* @return {[type]} [description]
*/
    pageHeight () {
        return Math.max(
            document.documentElement.clientHeight,
            window.innerHeight || 0
        );
    },

    /**
 *
 *根据父节点，计算当前节点的坐标
 * @export
 * @param {*} relativeNode
 * @param {*} node
 * @returns
 */
    getGeoByRelativeNode (relativeNode: any, node: any) {
        const getX = function (currentNode: any) {
            if (currentNode.index === 1 && currentNode.count === 1) {
                return relativeNode.x;
            } else if (currentNode.count > 1) {
                const rowWidth = currentNode.count * currentNode.width + (currentNode.count - 1) * currentNode.margin;
                const boundX = (relativeNode.x + Math.round(relativeNode.width / 2)) - Math.round(rowWidth / 2);
                if (currentNode.index === 1) { return boundX; };
                return boundX + (currentNode.index - 1) * currentNode.width + (currentNode.index - 1) * currentNode.margin;
            }
        };

        const getY = function (currentNode: any) {
            if (
                (currentNode.level === 0 && currentNode.count === 1) ||
          (currentNode.level === relativeNode.level)
            ) {
                return relativeNode.y;
            } else {
                if (currentNode.level > relativeNode.level) {
                    const space = relativeNode.height + currentNode.margin;
                    return relativeNode.y + space;
                } else {
                    const space = currentNode.height + currentNode.margin;
                    return relativeNode.y - space;
                }
            }
        };

        node.x = getX(node);
        node.y = getY(node);
        return node;
    },
    /**
*
*
* @export
* @param {*} origin
* @param {*} node
* @returns
*/
    getGeoByStartPoint (origin: any, node: any) {
        const { x: startX, y: startY } = origin;

        node.x = startX;
        node.y = startY;

        // 计算 坐标 X
        const isEven = node.count % 2 === 0;
        const halfNode = Math.round(node.width / 2) + Math.round(node.margin / 2);
        const middle = Math.round(node.count / 2);
        const index = Math.round(node.index - middle);
        const i = Math.abs(index);

        let distance = (i * node.width + i * node.margin);
        if (index > 0) {
            if (isEven) {
                distance = distance - halfNode;
            }
            node.x = startX + distance;
        } else if (index <= 0) {
            if (isEven) {
                distance = distance + halfNode;
            }
            node.x = startX - distance;
        }

        // 计算坐标 Y
        const l = Math.abs(node.level);
        const distanceY = (l * node.height + l * node.margin);
        if (node.level > 0) {
            node.y = startY + distanceY;
        } else if (node.level < 0) {
            node.y = startY - distanceY;
        }
        return node;
    },
    /**
*
*
* @param {*} node
* @returns
*/
    getNodeHeight (node: any){
        const l = Math.abs(node.level);
        const rowHeight = (l + 1) * node.height + l * node.margin;
        return rowHeight;
    },
    /**
*
*
* @param {*} node
* @returns
*/
    getNodeWidth (node: any){
        const rowWidth = node.count * node.width + (node.count - 1) * node.margin;
        return rowWidth;
    },
    /**
*
*
* @param {*} currentNode
* @returns
*/
    getRowWidth (currentNode: any){
        return currentNode.count * currentNode.width + (currentNode.count - 1) * currentNode.margin;
    },
    /**
*
*
* @param {*} node
* @returns
*/
    getParentNodeRelativeGeoX (node: any){
        let geoX = 10;
        if (node.index === 1 && node.count === 1) {
            geoX = node.x;
        } else if (node.rowWidth) {
            geoX = Math.round(node.rowWidth / 2);
        } else {
            geoX = Math.round(this.getRowWidth(node) / 2);
        }
        return geoX;
    },

    /**
* 统计节点信息
*//**
*
*
* @param {*} node
* @param {*} childrenField
* @returns
*/
    getNodeLevelAndCount (node: any, childrenField: any){
        let count = 1;
        let maxLevel = 1;

        const getReturn = function () {
            return {
                maxCount: count,
                maxLevel: maxLevel,
            };
        };

        if (!node) {
            return getReturn();
        }

        const getMaxLevel = (node: any) => {
            let max = 0;

            const children = node[childrenField || 'subTaskVOS'];
            if (children && children.length > 0) {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let j = 0; j < children.length; j++) {
                    const l = getMaxLevel(children[j]);
                    max = l > max ? l : max;
                }
            } else {
                count++;
            }
            return max + 1;
        };

        maxLevel = getMaxLevel(node);

        return getReturn();
    },

    /**
* 统计节点信息
*//**
*
*
* @param {*} data
* @param {*} currentNode
* @returns
*/
    getRowCountOfSameLevel (data: any, currentNode: any){
        let count = 0;
        let index = 0;

        const getReturn = function () {
            return {
                count,
                index,
            };
        };

        if (!currentNode) {
            return getReturn();
        }

        const { id, level } = currentNode;
        for (let i = 0; i < data.length; i++) {
            const source = data[i].source;
            if (source && source.level === level) {
                count++;
                if (source.id === id && index === 0) {
                    index = i;
                }
            }
        }

        return getReturn();
    },
    /**
*
*先计算 level。 maxLevel , maxCount
*计算 index, count
*根据 maxLevel， maxCount 计算宽高，根据 level, index , relativeNode计算 x, y;
* @param {*} node
* @param {*} currentNode
* @param {*} childrenField
* @returns
*/
    getNodeIndexAndCount (node: any, currentNode: any, childrenField: any) {
        let count = 0;
        const level = 0;
        let index = 0;

        const loop = (node: any, l: number) => {
            const children = node[childrenField || 'subTaskVOS'];
            if (children) {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let j = 0; j < children.length; j++) {
                    const o = children[j];
                    const lev = l + 1;
                    const sameLevel = lev === Math.abs(currentNode.level);
                    if (sameLevel) {
                        count++;
                        if (currentNode.id === o.id) {
                            index = count;
                        }
                    } else {
                        loop(o, lev);
                    }
                }
            }
        };

        loop(node, level);

        return {
            count,
            index,
        };
    },
};
export default layout;


