import React, { useState, useEffect, useRef } from 'react'
import './gigDetail.css'
import { GigCard } from '../GigCard/GigCard'
import { useDispatch, useSelector } from 'react-redux'
import { getGigDetail, getUserGigs } from '../../actions/gigAction'
import { Link, useParams } from 'react-router-dom'
import { flags } from '../../data/country-flags'
import Moment from 'react-moment';
import 'moment-timezone';
import { RatingStars } from '../RatingStars/RatingStars'
import { MyCarousel } from '../Carousel/MyCarousel'
import { RatingBars } from '../RatingBars/RatingBars'


export const GigDetail = () => {
  const dispatch = useDispatch();
  const params = useParams();

  let [gigReviews, setGigReviews] = useState(null);
  const [reviewCount, setReviewCount] = useState(5);
  let [arr, setArr] = useState([0, 0, 0, 0, 0]);
  const [pricePackageInfo, setPricePackageInfo] = useState(null);

  useEffect(() => {
    dispatch(getGigDetail(params.id));
  }, [dispatch, params.id])

  const { gigDetail } = useSelector(state => state.gigDetail);

  useEffect(() => {
    // console.log(gigDetail);
    setGigReviews(gigDetail && gigDetail.reviews);
    setPricePackageInfo(gigDetail && gigDetail.pricing[0])
  }, [gigDetail])

  const getFlag = (flagName) => flags.find(flag => {
    if (flag.name === flagName) {
      return flag;
    }
    return null;
  });

  const increaseReviewCount = (reviewCount) => () => {
    setReviewCount(reviewCount + 5);
  }

  const reviewCountAccoridingToRating = (rating) => {
    arr = [0, 0, 0, 0, 0];
    gigDetail.reviews.map(review => {
      return ++arr[review.rating - 1];
    })
    if (rating == -1) {
      return -1;
    }
    return arr[rating - 1];
  }

  gigDetail && reviewCountAccoridingToRating(-1);

  const handleClickOnRating = (rating) => () => {
    setReviewCount(5);
    const selectedRating = document.getElementById('rating-' + rating);
    const classList = selectedRating.classList;
    if (selectedRating.classList.contains('gig-review-rating-selected')) {
      setGigReviews(gigDetail.reviews);
      classList.remove('gig-review-rating-selected');
    }
    else {
      getReviewsOnSelectedRating(rating);
      ratingSelected(rating);
    }
  }

  const getReviewsOnSelectedRating = (rating) => {
    const temp = gigDetail.reviews.filter(review =>
      review.rating === rating
    )
    setGigReviews(temp);
  }

  const ratingSelected = (rating) => {
    document.getElementById('rating-' + 5).classList.remove('gig-review-rating-selected');
    document.getElementById('rating-' + 4).classList.remove('gig-review-rating-selected');
    document.getElementById('rating-' + 3).classList.remove('gig-review-rating-selected');
    document.getElementById('rating-' + 2).classList.remove('gig-review-rating-selected');
    document.getElementById('rating-' + 1).classList.remove('gig-review-rating-selected');
    document.getElementById('rating-' + rating).classList.add('gig-review-rating-selected');
  }

  console.log(gigDetail);
  const handlePricePackageSelection = (e) => {
    if (e.target.classList.contains('price-package-selected')) {
      return;
    }
    else {
      const parent = e.target.parentElement;
      const children = parent.children;
      var index = Array.prototype.indexOf.call(children, e.target);
      for (let i = 0; i < children.length; i++) {
        children[i].classList.remove('price-package-selected');
      }
      e.target.classList.add('price-package-selected');
      setPricePackageInfo(gigDetail.pricing[index]);
    }
  }

  // const [a, setA] = useState(0);
  // window.addEventListener('scroll', (event) => {
  //   setA(window.scrollY);
  //   console.log(a);
  //   // document.getElementById('price-section-large').style.transform = ;
  //   // console.log(document.getElementById('price-section-large').style.transform);
  // })


  return (
    gigDetail &&
    <div className='gig-detail-main-wrapper'>

      <section className='gig-details-section'>
        <div className='gig-details-gig-overveiw'>
          <h1 className='gig-details-gig-title'>{gigDetail.title}</h1>
          <div className='gig-seller-overview'>
            <img src={gigDetail.user.avatar.url} alt="user profile"></img>
            <a href='#gig-owner-details-id'>
              <div className='gig-seller-overview-seller-name'>{gigDetail.user.name}</div>
            </a>
            &nbsp;
            &nbsp;
            <a href='#review-container'>
              <RatingStars rating={gigDetail.ratings}></RatingStars>
            </a>
            &nbsp;
            &nbsp;
            <div>{gigDetail.ratings.toFixed(1)}</div>
            &nbsp;
            &nbsp;
            <div>({gigDetail.numOfRatings})</div>
          </div>

        </div>
        <div className='gig-details-carousel'>
          <MyCarousel gig={gigDetail}></MyCarousel>
        </div>
        <section className='price-section small-screen'>
          <nav className='price-navigation'>
            <ul>
              <li onClick={handlePricePackageSelection} className='price-package-selected'>Basic</li>
              <li onClick={handlePricePackageSelection}>Standard</li>
              <li onClick={handlePricePackageSelection}>Premium</li>
            </ul>
          </nav>
          {
            pricePackageInfo &&
            <div className='price-section-details'>
              <header>
                <h3>
                  <div className='price-package-title'>{pricePackageInfo.packageTitle}</div>
                  <div className='price-package-price'>₹{pricePackageInfo.packagePrice}</div>
                </h3>
                <p>{pricePackageInfo.packageDescription}</p>
              </header>
              <div className='delivery-revision-div'>
                <div className='package-delivery'>
                  <i className="fa-regular fa-clock"></i>
                  <p>{pricePackageInfo.packageDeliveryTime} days</p>
                </div>
                <div className='package-revisions'>
                  <i className="fa-solid fa-repeat"></i>
                  <p>{pricePackageInfo.revisions}</p>
                </div>
              </div>
              <div className='package-output'>
                <ul>
                  <li className={pricePackageInfo.sourceFile === true ? 'package-output-selected' : undefined}>
                    <i className="fa-solid fa-check"></i>
                    Source File
                  </li>
                  <li className={pricePackageInfo.commercialUse === true ? 'package-output-selected' : undefined}>
                    <i className="fa-solid fa-check"></i>
                    Commercial Use
                  </li>
                </ul>
              </div>
              <footer>
                <button>Continue (₹{pricePackageInfo.packagePrice})</button>
              </footer>
            </div>
          }
          <div className='price-section-contact-me-button'>
            <button>Contact Seller</button>
          </div>
        </section>
        <div className='gig-details-description-div'>
          <header>
            <h2>About This Gig</h2>
          </header>
          <div className='gig-details-description-wrapper' dangerouslySetInnerHTML={{ __html: gigDetail.description }}>
          </div>
        </div>
        <div id='gig-owner-details-id' className='gig-owner-details-div'>
          <header>
            <h2>About The Seller</h2>
          </header>
          <div className='gig-owner-profile-info'>
            <img src={gigDetail.user.avatar.url}></img>
            <div>
              <Link to={`/user/${gigDetail.user._id}`}>
                <div className='gig-owner-name'>{gigDetail.user.name}</div>
              </Link>
              <div className='gig-owner-tagline'>{gigDetail.user.tagline}</div>
              <div className='gig-owner-rating-div'>
                <div>
                  <RatingStars rating={gigDetail.user.ratings}></RatingStars>
                </div>
                &nbsp;
                <div className='gig-owner-rating'>{gigDetail.user.ratings.toFixed(1)}</div>
                &nbsp;
                <div>({gigDetail.user.numOfRatings})</div>
              </div>
            </div>
          </div>
          <button>Contact Me</button>
          <div className='gig-onwer-stats-description'>
            <div className='gig-owner-stats'>
              <ul>
                <li>
                  From
                  <div>{gigDetail.user.country}</div>
                </li>
                <li>
                  Member since
                  <div>
                    <Moment format='MMM YYYY'>{gigDetail.user.userSince}</Moment>
                  </div>
                </li>
                <li>
                  Last delivery
                  <div>about 1 hour ago</div>
                </li>
              </ul>
            </div>
            <div className='gig-owner-decription'>
              {gigDetail.user.description}
            </div>
          </div>
        </div>
        <div id='review-container' className='gig-review-list-cotainer'>
          <div className='user-detail-review-list-container'>
            <div className='user-detail-review-list'>
              <h2>
                <span className='gig-detail-gig-review-count'>{gigDetail.numOfReviews} Reviews</span>
                &nbsp;
                &nbsp;
                <div className='user-detail-review-rating-stars'>
                  <i className='fas fa-star'></i>
                  <RatingStars rating={gigDetail.ratings}></RatingStars>
                </div>
                &nbsp;
                &nbsp;
                <span className='user-detail-gig-rating'>{gigDetail.ratings.toFixed(1)}</span>
              </h2>
              <div className='gig-review-rating-wise-division-wrapper'>
                <ul>
                  <li onClick={handleClickOnRating(5)}>
                    <span id="rating-5" className="rating-number">5 Stars</span>
                    <RatingBars rating={arr[4] / gigDetail.numOfRatings}></RatingBars>
                    <span>({arr[4]})</span>
                  </li>
                  <li onClick={handleClickOnRating(4)}>
                    <span id="rating-4" className='rating-number'>4 Stars</span>
                    <RatingBars rating={arr[3] / gigDetail.numOfRatings}></RatingBars>
                    <span>({arr[3]})</span>
                  </li>
                  <li onClick={handleClickOnRating(3)}>
                    <span id="rating-3" className='rating-number'>3 Stars</span>
                    <RatingBars rating={arr[2] / gigDetail.numOfRatings}></RatingBars>
                    <span>({arr[2]})</span>
                  </li>
                  <li onClick={handleClickOnRating(2)}>
                    <span id="rating-2" className='rating-number'>2 Stars</span>
                    <RatingBars rating={arr[1] / gigDetail.numOfRatings}></RatingBars>
                    <span>({arr[1]})</span>
                  </li>
                  <li onClick={handleClickOnRating(1)}>
                    <span id="rating-1" className='rating-number'>1 Star</span>
                    <RatingBars rating={arr[0] / gigDetail.numOfRatings}></RatingBars>
                    <span>({arr[0]})</span>
                  </li>
                </ul>
              </div>
              {
                gigReviews && gigReviews.map((review, index) => {
                  return (
                    index < reviewCount &&
                    <div className='user-detail-review' key={index} >
                      <div className='user-detail-review-customer'>
                        <img alt='client' src={review.avatar.url}></img>
                        <div className='user-detail-review-customer-name'>{review.name}</div>
                        <RatingStars rating={review.rating}></RatingStars>
                        <div>{review.rating}</div>
                      </div>
                      <div className='user-detail-review-customer-country'>
                        <img src={getFlag("India").image} alt='country flag'></img>
                        <div>{review.country}</div>
                      </div>
                      <p className='user-detail-review-paragraph'>{review.comment}</p>
                      <p className='user-detail-review-publish'>
                        Published
                        &nbsp;
                        <span><Moment fromNow={true}>{review.createdAt}</Moment></span>
                      </p>
                    </div>
                  )
                })
              }
              {
                gigReviews != null && gigReviews.length >= reviewCount &&
                <div className='user-review-see-more' onClick={increaseReviewCount(reviewCount)}>
                  + See more
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <section id='price-section-large' className='price-section large-screen'>
        <nav className='price-navigation'>
          <ul>
            <li onClick={handlePricePackageSelection} className='price-package-selected'>Basic</li>
            <li onClick={handlePricePackageSelection}>Standard</li>
            <li onClick={handlePricePackageSelection}>Premium</li>
          </ul>
        </nav>
        {
          pricePackageInfo &&
          <div className='price-section-details'>
            <header>
              <h3>
                <div className='price-package-title'>{pricePackageInfo.packageTitle}</div>
                <div className='price-package-price'>₹{pricePackageInfo.packagePrice}</div>
              </h3>
              <p>{pricePackageInfo.packageDescription}</p>
            </header>
            <div className='delivery-revision-div'>
              <div className='package-delivery'>
                <i className="fa-regular fa-clock"></i>
                <p>{pricePackageInfo.packageDeliveryTime} days</p>
              </div>
              <div className='package-revisions'>
                <i className="fa-solid fa-repeat"></i>
                <p>{pricePackageInfo.revisions}</p>
              </div>
            </div>
            <div className='package-output'>
              <ul>
                <li className={pricePackageInfo.sourceFile && 'package-output-selected'}>
                  <i className="fa-solid fa-check"></i>
                  Source File
                </li>
                <li className={pricePackageInfo.commercialUse && 'package-output-selected'}>
                  <i className="fa-solid fa-check"></i>
                  Commercial Use
                </li>
              </ul>
            </div>
            <footer>
              <button>Continue (₹{pricePackageInfo.packagePrice})</button>
            </footer>
          </div>
        }
        <div className='price-section-contact-me-button'>
          <button>Contact Seller</button>
        </div>
      </section>
      
    </div >
  )
}
