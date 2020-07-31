/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

enum Storyboard {
    static let main: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
}

extension UIStoryboard {
    func instantiateViewController<Type: UIViewController>(of type: Type.Type) -> Type {
        instantiateViewController(withIdentifier: String(describing: type)) as! Type
    }
}
