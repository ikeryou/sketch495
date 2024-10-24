import { Color } from 'three';
import { MyDisplay } from '../core/myDisplay';
import { Tween } from '../core/tween';
import { DisplayConstructor } from '../libs/display';
import { Util } from '../libs/util';
import { Val } from '../libs/val';


export class Line extends MyDisplay {

  private _total: number = Util.hit(3) ? 150 : Util.randomInt(30, 70);
  
  private _allTexts: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private _fixText: string = 'I_ENJOY_DRINKING_BEER_BECAUSE_IT_OFFERS_A_WIDE_VARIETY_OF_FLAVORS,_FROM_LIGHT_AND_REFRESHING_TO_DARK_AND_ROBUST._WHETHER_IT’S_RELAXING_AFTER_A_LONG_DAY_OR_SOCIALIZING_WITH_FRIENDS,_BEER_ALWAYS_ENHANCES_THE_EXPERIENCE._TRYING_DIFFERENT_TYPES,_LIKE_ALES,_LAGERS,_AND_CRAFT_BREWS,_IS_ALWAYS_EXCITING,_AS_EACH_ONE_BRINGS_SOMETHING_UNIQUE._BEER_IS_DEFINITELY_ONE_OF_MY_FAVORITE_BEVERAGES.';

  private _showRateA: Val = new Val(0);
  private _showRateB: Val = new Val(0);

  private _isShowed: boolean = false;

  private _buf: HTMLElement
  private _inner: HTMLElement
  private _kaigyou: number = 20

  constructor(opt: DisplayConstructor) {
    super(opt);

    this._buf = document.createElement('div');
    this._buf.classList.add('-buf');
    this.el.appendChild(this._buf);

    this._inner = document.createElement('div');
    this._inner.classList.add('-inner');
    this.el.appendChild(this._inner);

    let str = '';
    for (let i = 0; i < this._total; i++) {
      str += '<span style="color: #000;">_</span>'
      if(i % this._kaigyou == 0) {
        str += '<br>'
      }
    }
    this._buf.innerHTML = str;
    this._inner.innerHTML = str;
  }


  public show(d: number = 0): void {
    const t = 1
    Tween.a(this._showRateA, {
      val: [0, 1]
    }, t, d, Tween.ExpoEaseOut)

    Tween.a(this._showRateB, {
      val: [0, 1]
    }, t, d + t * 0.75, Tween.ExpoEaseInOut, null, null, () => {
      this.hide(2)
    }) 
  }


  public hide(d: number = 0): void {
    const t = 1
    Tween.a(this._showRateA, {
      val: 0
    }, t, d + t * 0.75, Tween.ExpoEaseOut, null, null, () => {
      this.show(2)
    }) 

    Tween.a(this._showRateB, {
      val: 0
    }, t, d, Tween.ExpoEaseInOut, () => {
      this._isShowed = false;
    }) 
  }


  // 更新
  protected _update(): void {
    super._update();

    const sA = this._showRateA.val;
    const sB = this._showRateB.val;

    if(sA <= 0 || this._isShowed) return

    let str = '';
    const etc = Util.map(sB, 0, this._total, 0, 1);
    const num = Util.map(sA, 0, this._total, 0, 1);
    for (let i = 0; i < num; i++) {
      let isText = i > etc;

      const t = this._allTexts.charAt(Util.random(0, this._allTexts.length - 1));

      const col = new Color(0x000000).offsetHSL(Util.map(i, 0, 1, 0, num - 1), 1, 0.5);
      const colR = new Color(0x000000);

      if(isText) {
        str += `<span style="color: ${colR.getStyle()}; background-color: ${col.getStyle()};">${t}</span>`
      }
      
      // isText = true;

      if (!isText) {
        if(i == 0) {
          str += `<span style="color: #FFF; background-color: ${col.getStyle()};">${this._fixText.charAt(i)}</span>`
        } else {
          str += this._fixText.charAt(i)
        }
      }

      if(i % this._kaigyou == 0) {
        str += '<br>'
      }
    }

    this._inner.innerHTML = str;

    

    if(sB >= 1) {
      this._isShowed = true;
    }
  }
}

