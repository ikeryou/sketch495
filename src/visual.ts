import { CatmullRomCurve3, CircleGeometry, Mesh, MeshBasicMaterial, Object3D, Shape, ShapeGeometry, Vector3 } from "three"
import { Canvas } from "../webgl/canvas"
import { Func } from "../core/func"
import { SvhGetter } from "../core/svhGetter"
import { LvhGetter } from "../core/lvhGetter"
import { Util } from "../libs/util"

export class Visual extends Canvas {

  private _con: Object3D
  private _debug: HTMLElement

  private _faceGeo:ShapeGeometry
  private _face:Mesh

  private _teeth: Array<Mesh> = []
  private _eye: Array<Mesh> = []

  private _bgColor:number = 0x000000
  private _faceColor:number = 0xffffff

  private _scrollRate:number = 0

  constructor(opt:any) {
    super(opt)

    this._debug = document.createElement('div')
    this._debug.classList.add('l-debug')
    document.body.appendChild(this._debug)
    this._debug.innerHTML = 'DEBUG'

    this._con = new Object3D()
    this.mainScene.add(this._con)

    this._faceGeo = this._getShape(0)

    this._face = new Mesh(
      this._faceGeo,
      new MeshBasicMaterial({
        color:0xff0000,
      })
    )
    this._con.add(this._face)

    for(let i = 0; i < 8 * 2; i++) {
      const m = this._getTeeth()
      this._teeth.push(m)
      this._con.add(m)
    }

    for(let i = 0; i < 2; i++) {
      const m = new Mesh(
        new CircleGeometry(0.5, 32),
        new MeshBasicMaterial({
          color:this._faceColor,
        })
      )
      this._eye.push(m)
      this.mainScene.add(m)
    }

    this._resize()
  }


  private _getTeeth():Mesh {
    const shape = new Shape()

    const w = 0.15
    const h = 0.3

    shape.moveTo(-w, 0)
    shape.lineTo(w, 0)
    shape.lineTo(0, -h)
    shape.lineTo(-w, 0)

    const m = new Mesh(
      new ShapeGeometry(shape),
      new MeshBasicMaterial({
        color:this._bgColor,
      })
    )

    return m
  }




  _update():void {
    super._update()

    const w = this.renderSize.width
    // const h = this.renderSize.height

    const h1 = SvhGetter.instance.val
    const h2 = LvhGetter.instance.val
    const h3 = Func.sh()
    this._debug.innerHTML = 'svh: ' + h1 + '<br>lvh: ' + h2 + '<br>sh: ' + h3
    let scrollRate = (h3 - h1) / (h2 - h1)

    // this._debug.innerHTML = 'rate: ' + scrollRate

    // if(scrollRate == undefined || Number.isNaN(scrollRate) || isNaN(scrollRate) || isFinite(scrollRate)) scrollRate = 0
    

    // this._scrollRate += (scrollRate - this._scrollRate) * 0.2

    if(Number.isNaN(scrollRate) || isNaN(scrollRate)) scrollRate = 0
    this._scrollRate = scrollRate
    // this._debug.innerHTML = 'rate: ' + this._scrollRate

    const s = w * 0.5
    this._face.scale.set(s, s, s)

    this._con.position.y = s * -0.2

    this._faceGeo.dispose()
    this._faceGeo = this._getShape(this._c * 0.5)
    this._face.geometry = this._faceGeo

    const tNum = this._teeth.length * 0.5
    this._teeth.forEach((val, i) => {
      const key = i % tNum

      const ts = s * 0.75
      val.scale.set(ts, ts, ts)

      let tn = Util.map(Func.sin2(this._c * 0.025 + i * 0.2), -1, 1, -1, 1) * 1

      val.position.x = s * Util.map(key, -0.4, 0.4, 0, tNum - 1) * Util.map(this._scrollRate, 1, 1, 0, 1)

      val.position.y = s * Util.map(
        Math.sin(Util.radian(Util.map(key, 0, 180, 0, tNum - 1))), 
        Util.map(this._scrollRate, 0.4, 0.65, 0, 1), 
        Util.map(this._scrollRate, 0.6, 1.1, 0, 1), 
        -1, 
        1
      ) + tn * 0.1

      val.rotation.z = Util.radian(Util.map(key, 10, -10, 0, tNum - 1) * Util.map(this._scrollRate, 1, 2, 0, 1) + tn * 5)

      if(i > tNum - 1) {
        val.position.y *= -1
        val.scale.y *= -1
        val.rotation.z *= -1
      }
    })

    this._eye.forEach((val, i) => {
      const eyeS = s * 0.025
      val.scale.set(eyeS, eyeS, eyeS)

      val.position.x = s * 0.25 * (i == 0 ? -1 : 1)
      val.position.y = s * Util.map(this._scrollRate, 0.5, 1, 0, 1)
    })

    if(this.isNowRenderFrame()) {
      this._render()
    }
  }

  _render():void {
    this.renderer.setClearColor(this._bgColor, 1)
    this.renderer.render(this.mainScene, this.cameraOrth)
  }

  isNowRenderFrame():boolean {
    return true
  }

  _resize():void {
    super._resize()

    const w = Func.sw()
    const h = SvhGetter.instance.val

    this.renderSize.width = w
    this.renderSize.height = h

    this._updateOrthCamera(this.cameraOrth, w, h)

    let pixelRatio:number = window.devicePixelRatio || 1
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(w, h)
  }

  // ---------------------------------
  private _getShape(ang:number = 0):ShapeGeometry {
      
    const arr:Array<Vector3> = []

    let speed = 1

    const radius = 0.5
    let i = 0
    const num = 20
    while(i < num) {
        let radian = Util.radian((ang * speed) + (360 / num) * i)
        let addRadius = Util.map(Func.sin2(ang * 0.05 + i * 0.2), 0, 1, -1, 1)
        addRadius *= 0.045

        let x = Math.sin(radian) * (radius + addRadius) * Util.map(this._scrollRate, 1, 1.15, 0, 1)
        let y = Math.cos(radian) * (radius + addRadius) * Util.map(this._scrollRate, 1, 1.97, 0, 1)

        arr.push(new Vector3(x, y, 0))

        i++
    }
    // arr.push(arr[0].clone())

    const curve = new CatmullRomCurve3(arr)
    curve['closed'] = true
    const points = curve.getPoints(128)
    const shape = new Shape()

    points.forEach((val,i) => {
        if(i == 0) {
            shape.moveTo(val.x, val.y)
        } else {
            shape.lineTo(val.x, val.y)
        }
    })
    
    return new ShapeGeometry(shape)
  }
}