/*
*  Copyright (C) 1998-2019 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from '../release/go';

/**
 * This CurvedLinkReshapingTool class allows for a {@link Link}'s path to be modified by the user
 * via the dragging of a single tool handle at the middle of the link.
 * Dragging the handle changes the value of {@link Link#curviness}.
 *
 * If you want to experiment with this extension, try the <a href="../../extensionsTS/CurvedLinkReshaping.html">Curved Link Reshaping</a> sample.
 * @category Tool Extension
 */
export class CurvedLinkReshapingTool extends go.LinkReshapingTool {
  private _originalCurviness: number = NaN;

  /**
   * @hidden @internal
   */
  public makeAdornment(pathshape: go.GraphObject): go.Adornment {
    const link = pathshape.part as go.Link;
    if (link !== null && link.curve === go.Link.Bezier && link.pointsCount === 4) {
      const adornment = new go.Adornment();
      adornment.type = go.Panel.Link;
      const h = this.makeHandle(pathshape, 0);
      this.setReshapingBehavior(h, go.LinkReshapingTool.All);
      h.cursor = 'move';
      adornment.add(h);
      adornment.category = this.name;
      adornment.adornedObject = pathshape;
      return adornment;
    } else {
      return super.makeAdornment(pathshape);
    }
  }

  /**
   * Start reshaping, if {@link #findToolHandleAt} finds a reshape handle at the mouse down point.
   *
   * If successful this sets {@link #handle} to be the reshape handle that it finds
   * and {@link #adornedLink} to be the {@link Link} being routed.
   * It also remembers the original link route (a list of Points) and curviness in case this tool is cancelled.
   * And it starts a transaction.
   */
  public doActivate(): void {
    super.doActivate();
    if (this.adornedLink !== null) this._originalCurviness = this.adornedLink.curviness;
  }

  /**
   * Restore the link route to be the original points and curviness and stop this tool.
   */
  public doCancel(): void {
    if (this.adornedLink !== null) this.adornedLink.curviness = this._originalCurviness;
    super.doCancel();
  }

  /**
   * Change the route of the {@link #adornedLink} by moving the point corresponding to the current
   * {@link #handle} to be at the given {@link Point}.
   * This is called by {@link #doMouseMove} and {@link #doMouseUp} with the result of calling
   * {@link #computeReshape} to constrain the input point.
   * @param {Point} newpt the value of the call to {@link #computeReshape}.
   */
  public reshape(newpt: go.Point): void {
    const link = this.adornedLink;
    if (link !== null && link.curve === go.Link.Bezier && link.pointsCount === 4) {
      const start = link.getPoint(0);
      const end = link.getPoint(3);
      const ang = start.directionPoint(end);
      const mid = new go.Point((start.x + end.x) / 2, (start.y + end.y) / 2);
      const a = new go.Point(9999, 0).rotate(ang + 90).add(mid);
      const b = new go.Point(9999, 0).rotate(ang - 90).add(mid);
      const q = newpt.copy().projectOntoLineSegmentPoint(a, b);
      let curviness = Math.sqrt(mid.distanceSquaredPoint(q));
      const port = link.fromPort;
      if (port === link.toPort && port !== null) {
        if (newpt.y < port.getDocumentPoint(go.Spot.Center).y) curviness = -curviness;
      } else {
        const diff = mid.directionPoint(q) - ang;
        if ((diff > 0 && diff < 180) || (diff < -180)) curviness = -curviness;
      }
      link.curviness = curviness;
    } else {
      super.reshape(newpt);
    }
  }
}
