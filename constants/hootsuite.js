const MAP_OF_HOOTSUITE_FIELDS = {
  Status: 'state',
  Date: 'scheduledSendTime',
  SocialPost: 'text',
  Media: 'mediaUrls',
}

const HOOTSUITE_VIDEO_RESTRICTIONS = {
  supportedFileTypes: ['mov', 'mp4'],
  videoSupportedNetworks: ['TWITTER', 'FACEBOOKPAGE', 'LINKEDIN'],
  maxNumVideos: 1,
  maxSizeMBs: { TWITTER: 5, FACEBOOKPAGE: 5, LINKEDIN: 5 },
  minHeightPixels: { TWITTER: 32, FACEBOOKPAGE: null, LINKEDIN: null },
  maxHeightPixels: { TWITTER: 1024, FACEBOOKPAGE: null, LINKEDIN: null },
  minWidthPixels: { TWITTER: 32, FACEBOOKPAGE: null, LINKEDIN: null },
  maxWidthPixels: { TWITTER: 1200, FACEBOOKPAGE: null, LINKEDIN: null },
  aspectRatio: {
    TWITTER: null,
    FACEBOOKPAGE: ['16:9', '9:16'],
    // LINKEDIN: ['1:2.4', '2.4:1'],
    LINKEDIN: null,
  },
  minDurationSecs: { TWITTER: 0.5, FACEBOOKPAGE: null, LINKEDIN: 3 },
  maxDurationSecs: { TWITTER: 140, FACEBOOKPAGE: 1200, LINKEDIN: 600 },
}

const HOOTSUITE_IMAGE_RESTRICTIONS = {
  supportedFileTypes: ['gif', 'jpeg', 'jpg', 'png'],
  imageSupportedNetworks: ['TWITTER', 'FACEBOOKPAGE', 'LINKEDIN'],
  staticGifs: { TWITTER: true, FACEBOOKPAGE: true, LINKEDIN: true },
  animatedGifs: { TWITTER: true, FACEBOOKPAGE: false, LINKEDIN: false },
  maxImages: { TWITTER: 4, FACEBOOKPAGE: null, LINKEDIN: 1 },
  imageMaxSizeMBs: 5,
  gifMaxSizeMBs: 3,
  imageMinHeightPixels: { TWITTER: 440, FACEBOOKPAGE: null, LINKEDIN: null },
  imageMaxHeightPixels: { TWITTER: null, FACEBOOKPAGE: null, LINKEDIN: null },
  aspectRatio: { TWITTER: ['2:1'], FACEBOOKPAGE: null, LINKEDIN: null },
}

module.exports = {
  MAP_OF_HOOTSUITE_FIELDS,
  HOOTSUITE_VIDEO_RESTRICTIONS,
  HOOTSUITE_IMAGE_RESTRICTIONS,
}
