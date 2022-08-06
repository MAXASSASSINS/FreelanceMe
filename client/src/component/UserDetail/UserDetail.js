import React, { useState, useEffect } from 'react'
import './userDetail.css'
import '../../utility/util.css'
import { GigCard } from '../GigCard/GigCard'
import { useDispatch, useSelector } from 'react-redux'
import { getUserGigs } from '../../actions/gigAction'
import { getGigUser } from '../../actions/userAction'
import { Link, useParams } from 'react-router-dom'
import { flags } from '../../data/country-flags'
import Moment from 'react-moment';
import 'moment-timezone';
import { RatingStars } from '../RatingStars/RatingStars'
import { ReviewList } from '../ReviewList/ReviewList'

export const UserDetail = () => {
	const params = useParams();
	const dispatch = useDispatch();

	const [reviewCount, setReviewCount] = useState(5);
	const [userReviewCount, setUserReviewCount] = useState(null);


	useEffect(() => {
		dispatch(getGigUser(params.id));
		dispatch(getUserGigs(params.id));
	}, [dispatch, params.id])

	const gigUser = useSelector(state => state.gigUser);
	const { userGigs } = useSelector(state => state.userGigs);

	useEffect(() => {
		setUserReviewCount(() => {
			let count = 0;
			userGigs && userGigs.map(userGig => {
				count += userGig.reviews.length;
			})
			return count;
		});
	}, [userGigs])
	console.log(userReviewCount);
	// console.log(gigUser);
	// console.log(userGigs);


	const getFlag = (flagName) => flags.find(flag => {
		if (flag.name === flagName) {
			return flag;
		}
		return null;
	});

	const increaseReviewCount = (reviewCount) => () => {
		setReviewCount(reviewCount + 5);
		console.log(reviewCount);
	}




	return (
		userGigs && gigUser && <div className='user-details-max-width-container'>
			<div className='user-info-div'>
				<div className='user-info-large-screen-border first-div'>
					<div className='user-info-wrapper'>
						<div className='user-info-list-icon'>
							<i className="fa-solid fa-bars bars"></i>
							<i className="fa-solid fa-heart"></i>
						</div>
						<div className='user-detail user-profile-pic'>
							<img src={gigUser.avatar.url} alt='gig profile'></img>
						</div>
						<div>
							<h1 className='user-detail-user-name'>{gigUser.name}</h1>
							<p className='user-detail-tagline'>{gigUser.tagline}</p>
						</div>
						<div className='user-info-review-container'>
							<RatingStars rating={gigUser.ratings}></RatingStars>
							&nbsp;
							&nbsp;
							<span>{gigUser.ratings.toFixed(1)}</span>
							&nbsp;
							&nbsp;
							<span className='user-detail-review-info'>({gigUser.numOfReviews} reviews)</span>
						</div>
					</div>
					<div className='user-detail-contact-me'>
						<button>Contact Me</button>
					</div>
					<div className='user-detail-where-abouts-container'>
						<ul>
							<li>
								<span><i class="fa-solid fa-location-dot"></i> From</span>
								<p>{gigUser.country}</p>
							</li>
							<li>
								<span> <i class="fa-solid fa-user"></i> Member Since</span>
								<p><Moment format='MMM YYYY'>{gigUser.userSince}</Moment></p>
							</li>
							<li>

								<span> <i class="fa-solid fa-paper-plane"></i> Last Delivery</span>
								<p>2 months</p>
							</li>
						</ul>
					</div>
				</div>
				<nav className='user-detail-navigation-container'>
					<button>About</button>
					<button>Gigs</button>
					<button>Reviews</button>
				</nav>
				<div className='user-info-large-screen-border'>
					<div className='user-core-container'>
						<div className='user-detail-description'>
							<h3>Description</h3>
							<p>{gigUser.description}</p>
						</div>
						<div className='user-detail-language'>
							<h3>Languages</h3>
							<ul>
								{
									gigUser.languages.map((language, index) => (
										<li key={index}>
											<span className='user-detail-language-name'>{language}</span>
											&nbsp;&nbsp;–
											<span className='user-detail-language-fluency'> Fluent</span>
										</li>
									))
								}
							</ul>
						</div>
						<div className='user-detail-skills-container'>
							<h3>Skills</h3>
							<ul>
								{
									gigUser.skills.map((skill, index) => (
										<li key={index}>{skill.name}</li>
									))
								}
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className='user-detail-gig-reviews-div'>
				<div className='user-detail-gig-list-container'>
					<h2>saba_parveen's Gigs</h2>
					<div className='user-detail-gig-list'>
						{
							userGigs && userGigs.map(userGig => (
								<GigCard gig={userGig} key={userGig._id}></GigCard>
							))
						}
					</div>
				</div>
				<div className='user-detail-review-list-container'>
					<div className='user-detail-review-list'>
						<h2>
							<span className='user-detail-review-heading'>Reviews as Seller</span> &nbsp; &nbsp;
							<div className='user-detail-review-rating-stars'>
								<i className='fas fa-star'></i>
								<RatingStars rating={gigUser.ratings}></RatingStars>
								&nbsp;
								&nbsp;
							</div>
							<span className='user-detail-gig-rating'>{gigUser.ratings.toFixed(1)}</span>
							&nbsp;
							&nbsp;
							<span className='user-detail-gig-review-count'>({gigUser.numOfRatings})</span>
						</h2>
						{
							userGigs.map(userGig => (
								userGig.reviews.map((review, index) => (
									index < reviewCount &&
									<div className='user-detail-review'>
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
								))
							))
						}
						{
							(userReviewCount != null && userReviewCount >= reviewCount) && 	
							<div className='user-review-see-more' onClick={increaseReviewCount(reviewCount)}>
								+ See more
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	)
}