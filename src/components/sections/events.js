import React, { useState, useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

const StyledEventsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  .events-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;

const Styledevent = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .event-inner {
        transform: translateY(-7px);
      }
    }
  }

  a {
    position: relative;
    z-index: 1;
  }

  .event-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 0px;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
  }
  .event-image{
    .img{
      border-radius: var(--border-radius);
    }
    
  }
  .event-description {
    color: var(--light-slate);
    font-size: 17px;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }
`;

const Events = () => {

  const data = useStaticQuery(graphql`
    {
      events: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/events/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              cover {
                childImageSharp {
                  gatsbyImageData(width: 700, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
                }
              }
            }
            html
          }
        }
      }
    }
  `);

  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealEvents = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealEvents.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 6;
  const events = data.events.edges.filter(({ node }) => node);
  const firstSix = events.slice(0, GRID_LIMIT);
  const eventsToShow = showMore ? events : firstSix;

  const eventInner = node => {
    const { frontmatter, html } = node;
    const {title, cover} = frontmatter;
    const image = getImage(cover);

    return (
      <div className="event-inner">
        <div className="event-image">
          <GatsbyImage image={image} alt={title} className="img" />
        </div>
      </div>
    );
  };

  return (
    <StyledEventsSection>
      <h2 ref={revealTitle}>Events Gallery</h2>


      <ul className="events-grid">  
        {prefersReducedMotion ? (
          <>
            {eventsToShow &&
              eventsToShow.map(({ node }, i) => (
                <Styledevent key={i}>{eventInner(node)}</Styledevent>
              ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {eventsToShow &&
              eventsToShow.map(({ node }, i) => (
                <CSSTransition
                  key={i}
                  classNames="fadeup"
                  timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                  exit={false}>
                  <Styledevent
                    key={i}
                    ref={el => (revealEvents.current[i] = el)}
                    style={{
                      transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                    }}>
                    {eventInner(node)}
                  </Styledevent>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </ul>

      <button className="more-button" onClick={() => setShowMore(!showMore)}>
        Show {showMore ? 'Less' : 'More'}
      </button>
    </StyledEventsSection>
  );
};

export default Events;
