/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class AnimatedTransition: NSObject, UIViewControllerAnimatedTransitioning {
    func transitionDuration(using transitionContext: UIViewControllerContextTransitioning?) -> TimeInterval {
        0.20
    }
    
    func animateTransition(using transitionContext: UIViewControllerContextTransitioning) {
        guard let toController = transitionContext.viewController(forKey: UITransitionContextViewControllerKey.to)
            else {
                return
        }
        
        transitionContext.containerView.addSubview(toController.view)
        toController.view.alpha = 0
        
        let animator = UIViewPropertyAnimator(
            duration: transitionDuration(using: transitionContext),
            curve: .easeIn
        ) {
            toController.view.alpha = 1
        }
        animator.addCompletion { _ in
            transitionContext.completeTransition(true)
        }
        animator.startAnimation()
    }
}
